import { Level } from "level";
import fs from "node:fs";

import type { Revision, ServerResource } from "../common/types";
import { dbSeed } from "./DatabaseSeed";
import { utime } from "../common/util";
import { randomBytes } from "node:crypto";
import { SearchIndex } from "./Search";
import { Entry } from "./Entry";
import type { DBSession } from "./Session";
import type { DBResource } from "./Resource";

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
const db = new Level("./data/wikinarau.db", { createIfMissing: true });
const dbContent = db.sublevel<string, DBContent>("DBContent", {
	valueEncoding: "json",
});
const dbRevision = db.sublevel<string, DBRevision>("DBRevision", {
	valueEncoding: "json",
});
const dbResource = db.sublevel<string, DBResource>("DBResource", {
	valueEncoding: "json",
});
const dbSession = db.sublevel<string, DBSession>("DBSession", {
	valueEncoding: "json",
});

const index = new SearchIndex();

export const initDB = async () => {
	await index.init();
	for (const [uri, content] of dbSeed.entries()) {
		if (!(await getContent(uri))) {
			await updateContentRevision(uri, content);
		}
	}
	setTimeout(async () => {
		for await (const uri of dbContent.keys()) {
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
		const c = await dbContent.get(uri);
		let curRev = c.lastRevision;
		if (revision) {
			while (curRev && curRev !== revision) {
				const r = await dbRevision.get(curRev);
				curRev = r.previousRevision;
			}
			if (curRev !== revision) {
				return null;
			}
		}
		const r = await dbRevision.get(curRev);
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
		return await dbRevision.get(id);
	} catch {
		return null;
	}
};

export const getSession = async (id: string): Promise<DBSession | null> => {
	try {
		return await dbSession.get(id);
	} catch {
		return null;
	}
};

export const setSession = async (
	id: string,
	data: DBSession,
): Promise<string | null> => {
	try {
		await dbSession.put(id, data);
		return id;
	} catch {
		return null;
	}
};

export const getResources = async (): Promise<ServerResource[]> => {
	const ret: ServerResource[] = [];
	for await (const path of dbResource.keys()) {
		const r = await dbResource.get(path);
		ret.push({
			...r,
			path,
		});
	}
	return ret;
};

export const getRevisionHistory = async (uri: string): Promise<Revision[]> => {
	try {
		const c = await dbContent.get(uri);
		let lastRevision = c.lastRevision;
		const ret: Revision[] = [];
		while (lastRevision) {
			const rev = await dbRevision.get(lastRevision);
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
		const old = await dbContent.get(uri);
		const newRev = await createRevision(
			content,
			old.lastRevision,
			commitMessage,
		);
		await dbContent.put(uri, {
			createdAt: old.createdAt,
			lastRevision: newRev,
		});
	} catch {
		const newRev = await createRevision(content, "", commitMessage);
		await dbContent.put(uri, {
			createdAt: utime(),
			lastRevision: newRev,
		});
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
): Promise<string> => {
	let key = newKey();
	for (let i = 0; i < 10; i++) {
		const rev = await getRevision(key);
		if (!rev) {
			break;
		}
		if (i > 8) {
			throw new Error("Can't generate Revision Key");
		}
	}
	const createdAt = utime();
	await dbRevision.put(key, {
		createdAt,
		content,
		previousRevision,
		commitMessage,
	});
	return key;
};

export const createResource = async (
	path: string,
	name: string,
	ext: string,
	hash: string,
	type: string,
) => {
	const createdAt = utime();
	await dbResource.put(path, {
		createdAt,
		meta: {},
		name,
		ext,
		hash,
		type,
	});
	return path;
};
