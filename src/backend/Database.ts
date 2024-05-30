import sqlite from "better-sqlite3";
import type { Database as SQLiteDatabase } from "better-sqlite3";
import fs from "node:fs";

import type { ServerResource } from "../common/types";

export interface Content {
	uri: string;
	lastRevision: number;
	content: string;
}

export class Database {
	private readonly db: SQLiteDatabase;
	private static readonly seedEntries:Map<string, string> = new Map();

	static addSeed(url: string, content: string) {
		this.seedEntries.set(url, content);
	}

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
		this.seedDatabase();
	}

	private seedDatabase() {
		for(const [uri, content] of Database.seedEntries.entries()){
			if(!this.getContent(uri)){
				this.createContentRevision(uri, content);
			}
		}
	}

	searchContent(sword: string): Content[] {
		const ret: Content[] = [];
		const select = this.db.prepare(`SELECT * from content WHERE uri LIKE ?;`);
		for (const r of select.iterate(`%${sword}%`)) {
			const res = r as any;
			const rev =
				res.contentRevision && this.getRevision(res.contentRevision as number);
			if (rev) {
				ret.push({
					uri: res.uri,
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

	getResources(): ServerResource[] {
		const ret: ServerResource[] = [];
		const select = this.db.prepare(`SELECT * from resource;`);
		for (const r of select.iterate()) {
			const res = r as any;
			ret.push({
				id: res.id,
				createdAt: res.createdAt,
				ext: res.fileExt,
				hash: res.fileHash,
				name: res.fileName,
				path: res.filePath,
				type: res.fileType,
			});
		}
		return ret;
	}

	updateContentRevision(uri: string, content: string) {
		const update = this.db.prepare(
			`UPDATE content SET modifiedAt = ?, contentRevision = ? WHERE uri = ?;`,
		);

		const old = this.getContent(uri);
		if (!old) {
			if (!uri.startsWith("/wiki/")) {
				throw "The URL of new pages must begin with /wiki/ for future-proofing.";
			}
			const rev = this.createRevision(content, 0);
			this.createContent(uri, rev as number);
			return rev;
		} else {
			const now = Math.floor(+new Date() / 1000);
			const n = this.createRevision(content, old?.lastRevision);
			update.run(now, n, uri);
			return n;
		}
	}

	createContent(uri: string, contentRevision = 0) {
		const insert = this.db.prepare(
			`INSERT INTO content (createdAt, modifiedAt, deletedAt, uri, contentRevision) VALUES (?, ?, ?, ?, ?);`,
		);
		const now = Math.floor(+new Date() / 1000);
		const res = insert.run(now, now, 0, uri, contentRevision);
		return res.lastInsertRowid;
	}

	createRevision(content: string, previousRevision = 0) {
		const insert = this.db.prepare(
			`INSERT INTO revision (createdAt, previousRevision, content) VALUES (?, ?, ?);`,
		);
		const now = Math.floor(+new Date() / 1000);
		const res = insert.run(now, previousRevision, content);
		return res.lastInsertRowid;
	}

	createContentRevision(uri: string, content: string) {
		const rev = this.createRevision(content);
		const con = this.createContent(uri, rev as number);
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
