import { randomBytes } from "crypto";
import { User } from "./User";
import { utime } from "../common/util";
import { getSession, setSession } from "./db";
import { DBID } from "./db/db";

export interface DBSession {
	createdAt: number;
	user: DBID;
}

export class Session {
	private static idMap: Map<string, Session> = new Map();

	static async create(): Promise<Session> {
		const id = randomBytes(30).toString("base64");
		const createdAt = new Date();
		const ses = new Session(id, createdAt);
		await setSession(id, ses.serialize());
		Session.idMap.set(id, ses);
		return ses;
	}

	public async save() {
		await setSession(this.id, this.serialize());
	}

	private serialize(): DBSession {
		return {
			createdAt: utime(this.createdAt),
			user: this.user?.id || 0,
		};
	}

	static async get(id: string): Promise<Session | null> {
		if (!id) {
			return null;
		}
		const map = Session.idMap.get(id);
		if (map) {
			return map;
		}
		const db = await getSession(id);
		if (db) {
			return new Session(
				id,
				new Date(db.createdAt * 1000),
				User.getById(db.user),
			);
		} else {
			return null;
		}
	}

	constructor(
		public readonly id: string,
		private readonly createdAt: Date,
		public user?: User,
	) {}
}
