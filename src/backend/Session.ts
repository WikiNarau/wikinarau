import { randomBytes } from "crypto";
import type { Server } from "./Server";
import { User } from "./User";
import { utime } from "../common/util";

export interface DBSession {
	userEmail: string;
	createdAt: number;
}

export class Session {
	private static idMap: Map<string, Session> = new Map();

	static async create(server: Server): Promise<Session> {
		const id = randomBytes(30).toString("base64");
		const createdAt = new Date();
		const ses = new Session(server, id, createdAt);
		await server.db.setSession(id, ses.serialize());
		Session.idMap.set(id, ses);
		return ses;
	}

	private serialize(): DBSession {
		return {
			userEmail: this.user ? this.user.email : "",
			createdAt: utime(this.createdAt),
		};
	}

	static async get(server: Server, id: string): Promise<Session | null> {
		if (!id) {
			return null;
		}
		const map = Session.idMap.get(id);
		if (map) {
			return map;
		}
		const db = await server.db.getSession(id);
		if (db) {
			return new Session(server, id, new Date(db.createdAt * 1000));
		} else {
			return null;
		}
	}

	constructor(
		private readonly server: Server,
		public readonly id: string,
		private readonly createdAt: Date,
		public user?: User,
	) {}
}
