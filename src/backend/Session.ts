import { randomBytes } from "crypto";
import { User } from "./User";
import { utime } from "../common/util";
import { getSession, setSession } from "./db";
import { DBID } from "./db/db";
import type { Socket } from "./Socket";

export interface DBSession {
	createdAt: number;
	user: DBID;
}

export class Session {
	private static idMap: Map<string, Session> = new Map();
	public readonly socketSet = new Set<Socket>();
	private _user: User | undefined;

	static async create(): Promise<Session> {
		const id = randomBytes(30).toString("base64");
		const createdAt = new Date();
		const ses = new Session(id, createdAt);
		await setSession(id, ses.serialize());
		Session.idMap.set(id, ses);
		return ses;
	}

	public async forEachSocket(fun: (s: Socket) => void | Promise<void>) {
		console.log(`forEachSocket: ${this.socketSet.size}`);
		for (const socket of this.socketSet) {
			await fun(socket);
		}
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

	public get user(): User | undefined {
		return this._user;
	}

	public set user(user: User | undefined) {
		if (this._user) {
			this._user.sessionSet.delete(this);
		}
		this._user = user;
		if (user) {
			user.sessionSet.add(this);
		}
	}

	constructor(
		public readonly id: string,
		private readonly createdAt: Date,
		user?: User,
	) {
		this.user = user;
	}
}
