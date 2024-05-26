import type { Content, ContentType, Database } from "./Database";
import { renderJSONList } from "../common/contentTypes";
import * as toml from 'smol-toml'

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

	public readonly title: string;
	public readonly content: string;
	public readonly contentType: ContentType;
	public readonly lastReviion: Date;
	public readonly uri: string;

	constructor(
		title: string,
		content: string,
		contentType: ContentType,
		lastRevision: Date,
		uri: string,
	) {
		this.title = title;
		this.content = content;
		this.contentType = contentType;
		this.lastReviion = lastRevision;
		this.uri = uri;
	}

	static fromContent(c: Content): Entry {
		return new Entry(
			c.title,
			c.content,
			c.contentType,
			new Date(c.lastRevision),
			c.uri,
		);
	}

	static setTemplate(transformedTemplate: string) {
		this.template = transformedTemplate;
	}

	static setFooter(footerHTML: string) {
		this.footer = footerHTML;
	}

	public static renderTemplate(title: string, content: string) {
		return Entry.template
			.replace("<!--TITLE-->", title)
			.replace("<!--CONTENT-->", content)
			.replace("<!--FOOTER-->", Entry.footer);
	}

	private renderFrontmatterContent(content:string):[Record<string, any>, string] {
		if(!content.startsWith("---")){
			return [{},content];
		}
		const parts = content.split("---").map(s => s.trim()).filter(s => s);
		if(parts.length !== 2){
			return [{},content];
		}
		const coRaw = parts[1];
		try {
			const fmData = toml.parse(parts[0])
			return [fmData, coRaw];
		} catch {
			console.error("Invalid TOML Frontmatter");
			console.error(parts[0]);
			return [{},coRaw];
		}
	}

	public renderHTML() {
		try {
			console.log(this.content);
			const [frontmatter, content] = this.renderFrontmatterContent(this.content);
			const html = renderJSONList(JSON.parse(content));
			const {title} = frontmatter;

			const body = `<h1>${title}</h1>
			<i6q-frame section="main" meta='${JSON.stringify(frontmatter).replace(/'/g, '&#39;')}'>
				${html}
				<i6q-code slot="code" value='${this.content.replace(/'/g, '&#39;')}'></i6q-code>
			</i6q-frame>`;
			return Entry.renderTemplate(title, body);
		} catch (e) {
			console.error(e);
			return "";
		}
	}

	public renderTeaser(i: number) {
		return `<h3>${i + 1}. <a href="${this.uri}">${this.title}</a></h3>`;
	}

	static async getByURI(db: Database, uri: string): Promise<Entry | null> {
		const con = db.getContent(uri);
		if (con) {
			return Entry.fromContent(con);
		} else {
			return null;
		}
	}
}
