import type { Content, ContentType, Database } from "./Database";
import type { SerializedElement } from "../common/contentTypes";

export class Entry {
	private static template = `
	<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title><!--TITLE--></title>
  </head>
  <body>
    <h1>Can't load/transform index.html, check your server config!!!</h1>
    <main>
      <!--CONTENT-->
    </main>
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

	// ToDo: proper escaping, and making sure only safe attributes/tags can be used
	public static renderJSONElement(ele: SerializedElement): string {
		if (!ele) {
			return "";
		}

		switch (ele.T) {
			case "":
				return ele.text;
			case "MultipleChoice":
				return `<i6q-multiple-choice ${ele.multiple ? "multiple" : ""}>${
					ele.C ? Entry.renderJSONList(ele.C) : ""
				}</i6q-multiple-choice>`;
			case "Option":
				return `<i6q-multiple-choice-option ${ele.correct ? "correct" : ""}>${
					ele.C ? Entry.renderJSONList(ele.C) : ""
				}</i6q-multiple-choice-option>`;
			case "Box":
				return `<i6q-box summary="${ele.summary || ""}" variant="${
					ele.variant || ""
				}">${ele.C ? Entry.renderJSONList(ele.C) : ""}</i6q-box>`;
			case "Header":
				return `<i6q-header h=${ele.h}>${
					ele.C ? Entry.renderJSONList(ele.C) : ""
				}</i6q-header>`;
			case "Img":
				return `<i6q-img src="${ele.src}" width="${ele.width}" width="${ele.height}"></i6q-img>`;
			case "Audio":
				return `<i6q-audio src="${ele.src}" ></i6q-audio>`;
			case "Video":
				return `<i6q-video src="${ele.src}" ></i6q-video>`;
			case "StemCell":
				return `<i6q-stem-cell></i6q-stem-cell>`;
			case "Text":
				return `<i6q-text>${
					ele.C ? Entry.renderJSONList(ele.C) : ""
				}</i6q-text>`;
			default:
				const fc = ele.T.charAt(0);
				if (fc !== fc.toLowerCase()) {
					return "";
				}
				let atts = "";
				for (const k of Object.keys(ele)) {
					if (k === "T" || k === "C") {
						continue;
					}
					atts += ` ${k}="${ele[k]}"`;
				}
				return `<${ele.T}${atts}>${ele.C ? Entry.renderJSONList(ele.C) : ""}</${
					ele.T
				}>`;
		}
	}

	public static renderJSONList(list: SerializedElement[]): string {
		return Array.isArray(list)
			? list.map(Entry.renderJSONElement).join("\n")
			: "";
	}

	private renderContent() {
		try {
			return Entry.renderJSONList(JSON.parse(this.content));
		} catch (e) {
			console.error(e);
			return "";
		}
	}

	public renderHTML() {
		const html = this.renderContent();
		const content = `<h1>${this.title}</h1>
		<i6q-page-bar></i6q-page-bar>
		<i6q-frame section="main">${html}</i6q-frame>`;
		return Entry.renderTemplate(this.title, content);
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
