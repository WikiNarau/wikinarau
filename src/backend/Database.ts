import fs from "node:fs";
import sqlite from "better-sqlite3";

import type { Revision, ServerResource } from "../common/types";
import { dbSeed } from "./DatabaseSeed";
import { utime } from "../common/util";
import { randomBytes } from "node:crypto";
import { SearchIndex } from "./Search";
import { Entry } from "./Entry";
import type { DBSession } from "./Session";

export type DBID = number | bigint;

export interface Content {
	uri: string;
	content: string;
	lastRevision: string;

	createdAt: Date;
	modifiedAt: Date;
}

export interface DBContent {
	createdAt: number;
	lastRevision: string;
}

export interface DBRevision {
	createdAt: number;
	previousRevision: string;

	content: string;
	commitMessage?: string;
}

fs.mkdirSync("./data/", { recursive: true });
const index = new SearchIndex();
const db = new sqlite("./data/main.sqlite3");

export const userVersion = (): number => {
	const { user_version } = (db.pragma("user_version;") as any[])[0];
	return user_version;
};

export const setUserVersion = (v: number) => {
	db.pragma(`user_version = ${v};`);
};

const applyDBMigrations = () => {
	db.pragma("journal_mode=WAL;");
	const migrations = fs
		.readdirSync("./src/backend/databaseMigrations/")
		.sort(
			(a, b) =>
				parseInt(a.split(".").shift() || "0") -
				parseInt(b.split(".").shift() || "0"),
		);
	for (const m of migrations) {
		const newVer = parseInt(m.split(".").shift() || "0");
		const curVer = userVersion();
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
		db.exec(sql);
		setUserVersion(newVer);
	}
};

applyDBMigrations();
const contentGetByUri = db.prepare(
	"SELECT * from content where uri = ? LIMIT 1;",
);
const contentUpdate = db.prepare(
	"UPDATE content SET lastRevision=? where uri = ?;",
);
const contentCreate = db.prepare(
	"INSERT INTO content (createdAt, uri, lastRevision) VALUES (?,?,?);",
);

const revisionGetByID = db.prepare(
	"SELECT * from revision where id = ? LIMIT 1;",
);
const revisionCreate = db.prepare(
	"INSERT INTO revision (createdAt, previousRevision, content, commitMessage) values(?,?,?,?);",
);

const resourceCreate = db.prepare(
	"INSERT INTO resource (createdAt, path, extension, hash, name, type) VALUES (?,?,?,?,?,?);",
);
const resourceGetAll = db.prepare("SELECT * from resource;");

const sessionCreate = db.prepare(
	"INSERT INTO session (createdAt, token) VALUES (?,?);",
);
const sessionGet = db.prepare("SELECT * from session WHERE token = ? LIMIT 1;");

export const initDB = async () => {
	await index.init();
	for (const [uri, content] of dbSeed.entries()) {
		if (!(await getContent(uri))) {
			await updateContentRevision(uri, content);
		}
	}
	setTimeout(async () => {
		const q = db.prepare("SELECT uri FROM content;").all() as string[];
		console.log(q);
		for (const uri of q) {
			const entry = await Entry.getByURI(uri);
			if (entry) {
				await index.updateEntry(entry);
			}
		}
	});
};

export const searchContent = async (sword: string): Promise<Content[]> => {
	const ret: Content[] = [];
	const results = (await index.searchForEntry(sword)).sort(
		(a, b) => b.score - a.score,
	);
	for (const res of results) {
		const con = await getContent(res.uri);
		if (con) {
			ret.push(con);
		}
	}
	return ret;
};

export const getContent = async (
	uri: string,
	revision = "",
): Promise<Content | null> => {
	try {
		const c = contentGetByUri.get(uri) as DBContent;
		let curRev = c.lastRevision;
		if (revision) {
			while (curRev) {
				if (String(curRev) === revision) {
					break;
				}
				const r = revisionGetByID.get(curRev) as DBRevision;
				curRev = r.previousRevision;
			}
			if (String(curRev) !== revision) {
				return null;
			}
		}
		const r = (await revisionGetByID.get(curRev)) as DBRevision;
		return <Content>{
			uri,
			lastRevision: c.lastRevision,
			content: r.content,
			createdAt: new Date(c.createdAt),
			modifiedAt: new Date(r.createdAt),
		};
	} catch {
		return null;
	}
};

export const getRevision = async (id: string): Promise<DBRevision | null> => {
	try {
		return revisionGetByID.get(id) as DBRevision;
	} catch {
		return null;
	}
};

export const getSession = async (id: string): Promise<DBSession | null> => {
	try {
		return sessionGet.get(id) as DBSession | null;
	} catch {
		return null;
	}
};

export const setSession = async (
	id: string,
	data: DBSession,
): Promise<string | null> => {
	try {
		sessionCreate.run(data.createdAt, id);
		return id;
	} catch {
		return null;
	}
};

export const getResources = async (): Promise<ServerResource[]> => {
	return resourceGetAll.all() as ServerResource[];
};

export const getRevisionHistory = async (uri: string): Promise<Revision[]> => {
	try {
		const c = contentGetByUri.get(uri) as DBContent;
		let lastRevision = c.lastRevision;
		const ret: Revision[] = [];
		while (lastRevision) {
			const rev = revisionGetByID.get(lastRevision) as DBRevision | null;
			if (!rev) {
				return ret;
			}
			ret.push({
				id: lastRevision,
				createdAt: rev.createdAt,
				content: rev.content,
				commitMessage: rev.commitMessage,
				uri,
			});
			lastRevision = rev.previousRevision;
		}
		return ret;
	} catch {
		return [];
	}
};

export const newKey = (): string => randomBytes(8).toString("base64");

export const updateContentRevision = async (
	uri: string,
	content: string,
	commitMessage = "",
) => {
	try {
		const old = contentGetByUri.get(uri) as DBContent;
		const newRev = await createRevision(
			content,
			old.lastRevision,
			commitMessage,
		);
		contentUpdate.run(newRev, uri);
	} catch {
		const newRev = await createRevision(content, "", commitMessage);
		contentCreate.run(utime(), uri, newRev);
	}
	const entry = await Entry.getByURI(uri);
	if (entry) {
		index.updateEntry(entry);
	}
};

export const createRevision = async (
	content: string,
	previousRevision = "",
	commitMessage = "",
): Promise<DBID> => {
	return revisionCreate.run(utime(), previousRevision, content, commitMessage)
		.lastInsertRowid;
};

export const createResource = async (
	path: string,
	name: string,
	ext: string,
	hash: string,
	type: string,
) => {
	resourceCreate.run(utime(), path, name, ext, hash, type);
	return path;
};
