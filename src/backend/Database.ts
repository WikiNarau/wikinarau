import { Level } from "level";
import fs from "node:fs";

import type { ServerResource } from "../common/types";
import { dbSeed } from "./DatabaseSeed";
import { utime } from "../common/util";
import { randomBytes } from "node:crypto";

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
	private readonly dbContent: ReturnType<typeof this.db.sublevel<string, DBContent>>;
	private readonly dbRevision: ReturnType<typeof this.db.sublevel<string, DBRevision>>;
	private readonly dbResource: ReturnType<typeof this.db.sublevel<string, DBResource>>;


	constructor() {
		fs.mkdirSync("./data/", { recursive: true });
		this.db = new Level('./data/wikinarau.db', { createIfMissing: true });
		this.dbContent = this.db.sublevel<string, DBContent>("DBContent", { valueEncoding: 'json' });
		this.dbRevision = this.db.sublevel<string, DBRevision>("DBRevision", { valueEncoding: 'json' });
		this.dbResource = this.db.sublevel<string, DBResource>("DBResource", { valueEncoding: 'json' });
	}

	async seedDatabase() {
		for(const [uri, content] of dbSeed.entries()){
			if(!await this.getContent(uri)){
				await this.updateContentRevision(uri, content);
			}
		}
	}

	searchContent(_sword: string): Content[] {
		// Disabled for now
		return [];
	}

	async getContent(uri: string): Promise<Content | null> {
		try {
			const c = await this.dbContent.get(uri);
			const r = await this.dbRevision.get(c.lastRevision);
			return <Content>{
				uri,
				lastRevision: c.lastRevision,
				content: r.content,
				createdAt: new Date(c.createdAt),
				modifiedAt: new Date(r.createdAt)
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
				path
			});
		}
		return ret;
	}

	static newKey(): string {
		return randomBytes(8).toString('base64');
	}

	async updateContentRevision(uri: string, content: string) {
		try {
			const old = await this.dbContent.get(uri);
			const newRev = await this.createRevision(content, old.lastRevision);
			await this.dbContent.put(uri, { createdAt: old.createdAt, lastRevision: newRev });
		} catch {
			const newRev = await this.createRevision(content, "");
			await this.dbContent.put(uri, { createdAt: utime(), lastRevision: newRev });
		}
	}

	async createRevision(content: string, previousRevision = ""): Promise<string> {
		let key = Database.newKey();
		for(let i=0;i<10;i++){
			const rev = await this.getRevision(key);
			if(!rev){
				break;
			}
			if(i > 8){
				throw new Error("Can't generate Revision Key");
			}
		}
		const createdAt = utime();
		await this.dbRevision.put(key, {
			createdAt,
			content,
			previousRevision,
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
			type
		})
	}
}
