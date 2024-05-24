import sqlite from "better-sqlite3";
import type { Database as SQLiteDatabase } from "better-sqlite3";
import fs from "node:fs";

export type ContentType = "root" | "page";

export interface Content {
	uri: string;
	contentType: ContentType;
	lastRevision: number;
	content: string;
	title: string;
}

export class Database {
	private readonly db: SQLiteDatabase;

	private userVersion(): number {
		const { user_version } = (this.db.pragma("user_version;") as any[])[0];
		return user_version;
	}

	private setUserVersion(v: number) {
		this.db.pragma(`user_version = ${v};`);
	}

	applyMigrations() {
		const migrations = fs
			.readdirSync("./src/backend/databaseMigrations/")
			.sort(
				(a, b) =>
					parseInt(a.split(".").shift() || "0") -
					parseInt(b.split(".").shift() || "0"),
			);
		for (const m of migrations) {
			const newVer = parseInt(m.split(".").shift() || "0");
			const curVer = this.userVersion();
			if (curVer >= newVer) {
				continue;
			}
			if (newVer !== curVer + 1) {
				throw new Error(
					`Can't apply migrations, expected ${curVer + 1} but got ${newVer}`,
				);
			}
			const sql = fs.readFileSync(
				`./src/backend/databaseMigrations/${m}`,
				"utf-8",
			);
			console.log(sql);
			this.db.exec(sql);
			this.setUserVersion(newVer);
		}
	}

	constructor() {
		fs.mkdirSync("./data/", { recursive: true });
		this.db = new sqlite("data/main.db");
		this.db.pragma("journal_mode=WAL;");
		this.applyMigrations();
		if (!this.getContent("/")) {
			this.seedDatabase();
		}
	}

	private seedDatabase() {
		this.createContentRevision(
			"/",
			"root",
			"WikiLearn - learn, teach? both!",
			`[{"T":"Text","C":[{"T":"p","C":[{"T":"","text":"We are trying to build a platform for collaborative open learning material, you can use and edit any material, even without any registration."}]},{"T":"p","C":[{"T":"","text":"As a first example you can look at the following simple task:"},{"T":"a","C":[{"T":"","text":"Multiple-Choice"}],"href":"/wiki/berry"}]}]}]`,
		);
		this.createContentRevision(
			"/how-to",
			"root",
			"How to use CollaboWiki",
			`[{"T":"Text","C":[{"T":"Text","C":[{"T":"p","C":[{"T":"","text":"This page should contain a short guide/course on how to effectively use this tool to create content."}]}]}]}]`,
		);
		this.createContentRevision(
			"/contact-us",
			"root",
			"Contact us",
			`[{"T":"Text","C":[{"T":"Text","C":[{"T":"p","C":[{"T":"","text":"Once we have a domain name, this page should contain the E-Mail as well as a link to a Discord Server."}]}]}]}]`,
		);
		this.createContentRevision(
			"/wiki/berry",
			"root",
			"Multiple-Choice example",
			`[{"T":"Header","C":[{"T":"","text":"Welcome!!!"}],"h":"h2"},{"T":"Text","C":[{"T":"p","C":[{"T":"","text":"Just a simple placeholder page containing a single element."}]}]},{"T":"Img","src":"/res/db17b3f2/1631755080401.jpg","width":0,"height":0},{"T":"Text","C":[{"T":"p","C":[{"T":"","text":"Have some boxes!"}]}]},{"T":"Box","C":[{"T":"Text","C":[{"T":"","text":"Test"}]}],"variant":"primary","summary":"Testbox asd"},{"T":"Box","C":[{"T":"Text","C":[{"T":"","text":"Test"}]}],"variant":"success","summary":"Testbox - primary"},{"T":"Box","C":[{"T":"Text","C":[{"T":"","text":"Test"}]}],"variant":"neutral","summary":"Testbox"},{"T":"Box","C":[{"T":"Text","C":[{"T":"","text":"Test"}]}],"variant":"warning","summary":"Testbox"},{"T":"Box","C":[{"T":"Text","C":[{"T":"","text":"Test"}]}],"variant":"danger","summary":"Testbox"},{"T":"Box","C":[{"T":"Text","C":[{"T":"","text":"Test"}]}],"variant":"none","summary":"Testbox"},{"T":"Text","C":[{"T":"p","C":[{"T":"","text":"What color does the blackcurrant berry actually have?"}]}]},{"T":"Img","src":"/res/67e37743/konachan.com - 123456 kiki.jpg","width":0,"height":0},{"T":"MultipleChoice","C":[{"T":"Option","C":[{"T":"","text":"Black"}],"correct":false},{"T":"Option","C":[{"T":"","text":"Very dark purple"}],"correct":true},{"T":"Option","C":[{"T":"","text":"Blue"}],"correct":false},{"T":"Option","C":[{"T":"","text":"asdqwe"}],"correct":false}],"multiple":false}]`,
		);
	}

	searchContent(sword: string): Content[] {
		const ret: Content[] = [];
		const select = this.db.prepare(`SELECT * from content WHERE title LIKE ?;`);
		console.log(`Search: ${sword}`);
		for (const r of select.iterate(`%${sword}%`)) {
			const res = r as any;
			const rev =
				res.contentRevision && this.getRevision(res.contentRevision as number);
			if (rev) {
				ret.push({
					uri: res.uri,
					title: res.title,
					contentType: res.contentType,
					lastRevision: rev.id,
					content: rev.content,
				});
			}
		}
		return ret;
	}

	getContent(uri: string): Content | null {
		const select = this.db.prepare(`SELECT * from content WHERE uri = ?;`);
		const res = select.get(uri) as any;
		if (res) {
			const rev =
				res.contentRevision && this.getRevision(res.contentRevision as number);
			if (rev) {
				return <Content>{
					uri: res.uri,
					title: res.title,
					contentType: res.contentType,
					lastRevision: rev.id,
					content: rev.content,
				};
			}
		}
		return null;
	}

	getRevision(id: number): any {
		const select = this.db.prepare(`SELECT * from revision WHERE id = ?;`);
		const res = select.get(id) as any;
		return res;
	}

	updateContentRevision(uri: string, content: string, title: string) {
		const update = this.db.prepare(
			`UPDATE content SET modifiedAt = ?, contentRevision = ?, title = ? WHERE uri = ?;`,
		);
		if (!uri.startsWith("/wiki/")) {
			throw "Uris must start with a /";
		}
		const old = this.getContent(uri);
		if (!old) {
			const contentType: ContentType = uri.startsWith("/page/")
				? "page"
				: "root";
			const rev = this.createRevision(content, 0);
			this.createContent(uri, contentType, title, rev as number);
			return rev;
		} else {
			const now = Math.floor(+new Date() / 1000);
			const n = this.createRevision(content, old?.lastRevision);
			update.run(now, n, title, uri);
			return n;
		}
	}

	createContent(
		uri: string,
		contentType: ContentType,
		title = "",
		contentRevision = 0,
	) {
		const insert = this.db.prepare(
			`INSERT INTO content (createdAt, modifiedAt, deletedAt, uri, title, contentType, contentRevision) VALUES (?, ?, ?, ?, ?, ?, ?);`,
		);
		const now = Math.floor(+new Date() / 1000);
		const res = insert.run(
			now,
			now,
			0,
			uri,
			title,
			contentType,
			contentRevision,
		);
		return res.lastInsertRowid;
	}

	createRevision(content: string, previousRevision = 0) {
		const insert = this.db.prepare(
			`INSERT INTO revision (createdAt, modifiedAt, previousRevision, content) VALUES (?, ?, ?, ?);`,
		);
		const now = Math.floor(+new Date() / 1000);
		const res = insert.run(now, now, previousRevision, content);
		return res.lastInsertRowid;
	}

	createContentRevision(
		uri: string,
		contentType: ContentType,
		title = "",
		content: string,
	) {
		const rev = this.createRevision(content);
		const con = this.createContent(uri, contentType, title, rev as number);
		return con;
	}

	createResource(
		path: string,
		name: string,
		ext: string,
		hash: string,
		type: string,
	) {
		const insert = this.db.prepare(
			`INSERT INTO resource (createdAt, filePath, fileName, fileExt, fileHash, fileType) VALUES (?, ?, ?, ?, ?, ?);`,
		);
		const now = Math.floor(+new Date() / 1000);
		const res = insert.run(now, path, name, ext, hash, type);
		return res.lastInsertRowid;
	}
}
