import { Level } from "level";
import fs from "node:fs";

import type { Revision, ServerResource } from "../common/types";
import { dbSeed } from "./DatabaseSeed";
import { utime } from "../common/util";
import { randomBytes } from "node:crypto";
import { SearchIndex } from "./Search";
import { Entry } from "./Entry";

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

export interface DBResource {
	createdAt: number;
	name: string;
	type: string;
	ext: string;
	hash: string;
	meta: Record<string, any>;
}

export class Database {
	private readonly db: Level<string, any>;
	private readonly dbContent: ReturnType<
		typeof this.db.sublevel<string, DBContent>
	>;
	private readonly dbRevision: ReturnType<
		typeof this.db.sublevel<string, DBRevision>
	>;
	private readonly dbResource: ReturnType<
		typeof this.db.sublevel<string, DBResource>
	>;

	private index: SearchIndex;

	constructor() {
		fs.mkdirSync("./data/", { recursive: true });
		this.db = new Level("./data/wikinarau.db", { createIfMissing: true });
		this.dbContent = this.db.sublevel<string, DBContent>("DBContent", {
			valueEncoding: "json",
		});
		this.dbRevision = this.db.sublevel<string, DBRevision>("DBRevision", {
			valueEncoding: "json",
		});
		this.dbResource = this.db.sublevel<string, DBResource>("DBResource", {
			valueEncoding: "json",
		});
		this.index = new SearchIndex();
	}

	async init() {
		for (const [uri, content] of dbSeed.entries()) {
			if (!(await this.getContent(uri))) {
				await this.updateContentRevision(uri, content);
			}
		}
		await this.index.init();
		setTimeout(async () => {
			for await (const uri of this.dbContent.keys()) {
				const entry = await Entry.getByURI(this, uri);
				if (entry) {
					await this.index.updateEntry(entry);
				}
			}
		});
	}

	async searchContent(sword: string): Promise<Content[]> {
		const ret: Content[] = [];
		const results = (await this.index.searchForEntry(sword)).sort(
			(a, b) => b.score - a.score,
		);
		for (const res of results) {
			const con = await this.getContent(res.uri);
			if (con) {
				ret.push(con);
			}
		}
		return ret;
	}

	async getContent(uri: string, revision = ""): Promise<Content | null> {
		try {
			const c = await this.dbContent.get(uri);
			let curRev = c.lastRevision;
			if (revision) {
				while (curRev && curRev !== revision) {
					const r = await this.dbRevision.get(curRev);
					curRev = r.previousRevision;
				}
				if (curRev !== revision) {
					return null;
				}
			}
			console.log(`${curRev} === ${revision}`);
			const r = await this.dbRevision.get(curRev);
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
	}

	async getRevision(id: string): Promise<DBRevision | null> {
		try {
			return await this.dbRevision.get(id);
		} catch {
			return null;
		}
	}

	async getResources(): Promise<ServerResource[]> {
		const ret: ServerResource[] = [];
		for await (const path of this.dbResource.keys()) {
			const r = await this.dbResource.get(path);
			ret.push({
				...r,
				path,
			});
		}
		return ret;
	}

	async getRevisionHistory(uri: string): Promise<Revision[]> {
		try {
			const c = await this.dbContent.get(uri);
			let lastRevision = c.lastRevision;
			const ret: Revision[] = [];
			while (lastRevision) {
				const rev = await this.dbRevision.get(lastRevision);
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
	}

	static newKey(): string {
		return randomBytes(8).toString("base64");
	}

	async updateContentRevision(
		uri: string,
		content: string,
		commitMessage = "",
	) {
		try {
			const old = await this.dbContent.get(uri);
			const newRev = await this.createRevision(
				content,
				old.lastRevision,
				commitMessage,
			);
			await this.dbContent.put(uri, {
				createdAt: old.createdAt,
				lastRevision: newRev,
			});
		} catch {
			const newRev = await this.createRevision(content, "", commitMessage);
			await this.dbContent.put(uri, {
				createdAt: utime(),
				lastRevision: newRev,
			});
		}
		const entry = await Entry.getByURI(this, uri);
		if (entry) {
			this.index.updateEntry(entry);
		}
	}

	async createRevision(
		content: string,
		previousRevision = "",
		commitMessage = "",
	): Promise<string> {
		let key = Database.newKey();
		for (let i = 0; i < 10; i++) {
			const rev = await this.getRevision(key);
			if (!rev) {
				break;
			}
			if (i > 8) {
				throw new Error("Can't generate Revision Key");
			}
		}
		const createdAt = utime();
		await this.dbRevision.put(key, {
			createdAt,
			content,
			previousRevision,
			commitMessage,
		});
		return key;
	}

	async createResource(
		path: string,
		name: string,
		ext: string,
		hash: string,
		type: string,
	) {
		const createdAt = utime();
		await this.dbResource.put(path, {
			createdAt,
			meta: {},
			name,
			ext,
			hash,
			type,
		});
		return path;
	}
}
