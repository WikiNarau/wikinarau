import { DBID, db } from "./db";
import { utime } from "../../common/util";
import { SearchIndex } from "../Search";
import { dbSeed } from "./seed";
import { Entry } from "../Entry";
import { Revision } from "../../common/types";
import config from "../Config";
import { createUser, getUserIdByEmail } from "./user";
import { hashPasswordSync } from "./hash";

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

const index = new SearchIndex();
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

export const initDB = async () => {
	await index.init();
	for (const [uri, content] of dbSeed.entries()) {
		if (!(await getContent(uri))) {
			await updateContentRevision(uri, content);
		}
	}
	setTimeout(async () => {
		const q = db.prepare("SELECT uri FROM content;").all() as any[];
		for (const { uri } of q) {
			const entry = await Entry.getByURI(uri);
			if (entry) {
				await index.updateEntry(entry);
			}
		}
	});
	if (config.seedAdminEmail && config.seedAdminPassword) {
		const user = getUserIdByEmail(config.seedAdminEmail);
		if (!user) {
			const passwordHash = hashPasswordSync(config.seedAdminPassword);
			createUser({
				privilegeLevel: "admin",
				email: config.seedAdminEmail,
				passwordHash,
			});
			console.log(`Seeding Admin user ${config.seedAdminEmail}`);
		}
	}
};

export const getRevision = async (id: string): Promise<DBRevision | null> => {
	try {
		return revisionGetByID.get(id) as DBRevision;
	} catch {
		return null;
	}
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

export const updateContentRevision = async (
	uri: string,
	content: string,
	commitMessage = "",
) => {
	const old = contentGetByUri.get(uri) as DBContent | null;
	if (old) {
		const newRev = await createRevision(
			content,
			old.lastRevision,
			commitMessage,
		);
		contentUpdate.run(newRev, uri);
	} else {
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
