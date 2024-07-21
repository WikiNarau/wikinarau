import { type Content, getContent } from "./db";
import { renderJSONList, renderJSONListToText } from "../common/contentTypes";
import * as toml from "smol-toml";
import config from "./Config";
import type { User } from "./User";

export class Entry {
	private static template = `
	<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<title><!--TITLE--></title>
	<!--HEAD-->
</head>
<body>
	<h1>Can't load/transform index.html, check your server config!!!</h1>
	<main><!--CONTENT--></main>
	<footer><!--FOOTER--></footer>
</body>
</html>`;
	private static footer = ``;

	public readonly content: string;
	public readonly lastReviion: Date;
	public readonly uri: string;

	constructor(content: string, lastRevision: Date, uri: string) {
		this.content = content;
		this.lastReviion = lastRevision;
		this.uri = uri;
	}

	static fromContent(c: Content): Entry {
		return new Entry(c.content, new Date(c.lastRevision), c.uri);
	}

	static setTemplate(transformedTemplate: string) {
		this.template = transformedTemplate;
	}

	static setFooter(footerHTML: string) {
		this.footer = footerHTML;
	}

	static userMayCreate(uri: string, user?: User): boolean {
		if (uri.startsWith("/wiki/")) {
			return true;
		}
		if (!user) {
			return false;
		}
		if (
			user.privilegeLevel === "admin" ||
			user.privilegeLevel === "moderator"
		) {
			return true;
		}
		return false;
	}

	public static renderTemplate(title: string, content: string, head = "") {
		return Entry.template
			.replace("<!--TITLE-->", title)
			.replace("<!--CONTENT-->", content)
			.replace("<!--HEAD-->", head)
			.replace("<!--FOOTER-->", Entry.footer);
	}

	private splitFrontmatterContent(
		content: string,
	): [Record<string, any>, string] {
		if (!content.startsWith("---")) {
			return [{}, content];
		}
		const parts = content
			.split("---")
			.map((s) => s.trim())
			.filter((s) => s);
		if (parts.length !== 2) {
			return [{}, content];
		}
		const coRaw = parts[1];
		try {
			const fmData = toml.parse(parts[0]);
			return [fmData, coRaw];
		} catch {
			console.error("Invalid TOML Frontmatter");
			console.error(parts[0]);
			return [{}, coRaw];
		}
	}

	private genHeadFromFrontmatter(fm: Record<string, unknown>): string {
		let ret: string[] = [];
		if (fm.description && typeof fm.description === "string") {
			const att = fm.description.replace(/'/g, "&#39;");
			ret.push(`<meta name="description" content='${att}' />`);
		}
		const canonical = `${config.baseUri}${this.uri}`;
		ret.push(`<link rel="canonical" href="${canonical}" />`);
		return ret.join("\n");
	}

	public renderHTML() {
		try {
			const [frontmatter, content] = this.splitFrontmatterContent(this.content);
			const html = renderJSONList(JSON.parse(content));
			const { title } = frontmatter;

			const head = this.genHeadFromFrontmatter(frontmatter);
			const body = `<h1>${title}</h1>
			<wn-frame uri='${this.uri.replace(
				/'/g,
				"&#39;",
			)}' section="main" meta='${JSON.stringify(frontmatter).replace(
				/'/g,
				"&#39;",
			)}'>
				${html}
				<wn-code slot="code" value='${this.content.replace(/'/g, "&#39;")}'></wn-code>
			</wn-frame>`;
			return Entry.renderTemplate(title, body, head);
		} catch (e) {
			console.error(e);
			return "";
		}
	}

	renderText() {
		const [_frontmatter, content] = this.splitFrontmatterContent(this.content);
		return renderJSONListToText(JSON.parse(content));
	}

	public renderTeaser(i: number) {
		const [frontmatter, content] = this.splitFrontmatterContent(this.content);
		const title = frontmatter.title;
		let teaser = renderJSONListToText(JSON.parse(content)).substring(0, 256);
		if (teaser.length >= 255) {
			teaser += "…";
		}
		return `<h3>${i + 1}. <a href="${this.uri}">${title}</a></h3><p>${teaser}</p>`;
	}

	static async getByURI(uri: string, revision = ""): Promise<Entry | null> {
		const con = await getContent(uri, revision);
		if (con) {
			return Entry.fromContent(con);
		} else {
			return null;
		}
	}
}
