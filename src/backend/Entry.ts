import type { Content, ContentType, Database } from "./Database";
import { renderJSONList } from "../common/contentTypes";

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

	private renderContent() {
		try {
			return renderJSONList(JSON.parse(this.content));
		} catch (e) {
			console.error(e);
			return "";
		}
	}

	public renderHTML() {
		const html = this.renderContent();
		const content = `<h1>${this.title}</h1>
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
