import { createUser, DBUser, getUserById, getUserIdByEmail } from "./db/user";
import { DBID } from "./db/db";
import { hashPasswordSync, comparePasswordSync } from "./db";

export type PrivilegeLevel = "admin" | "moderator" | "user";

export class User {
	private static readonly idMap = new Map<DBID, User>();
	public readonly id: DBID;
	public readonly email: string;
	public readonly privilegeLevel: PrivilegeLevel;
	public readonly createdAt: Date;

	static getById(id: DBID): User | undefined {
		const old = User.idMap.get(id);
		if (old) {
			return old;
		}
		const db = getUserById(id);
		if (db) {
			const user = new User(db);
			User.idMap.set(id, user);
			return user;
		}
	}

	static getByEmail(email: string) {
		const id = getUserIdByEmail(email);
		return id ? this.getById(id) : undefined;
	}

	static create(
		password: string,
		data: Omit<DBUser, "id" | "passwordHash" | "createdAt">,
	): User {
		const oldUser = getUserIdByEmail(data.email);
		if (oldUser) {
			throw "E-Mail is already in use, please use a different one";
		}

		const passwordHash = hashPasswordSync(password);
		const id = createUser({ ...data, passwordHash });
		if (!id) {
			throw new Error(`Error while creating user: ${JSON.stringify(data)}`);
		}
		const dbUser = getUserById(id);
		if (!dbUser) {
			throw new Error(`Error while creating user: ${JSON.stringify(data)}`);
		}
		const user = new User(dbUser);
		User.idMap.set(id, user);
		return user;
	}

	static tryToLogin(email: string, password: string): User | null {
		const id = getUserIdByEmail(email);
		if (!id) {
			return null;
		}
		const dbUser = getUserById(id);
		if (!dbUser) {
			return null;
		}
		if (comparePasswordSync(password, dbUser.passwordHash)) {
			return new User(dbUser);
		} else {
			return null;
		}
	}

	constructor(data: DBUser) {
		this.id = data.id;
		this.email = data.email;
		this.privilegeLevel = data.privilegeLevel;
		this.createdAt = new Date(data.createdAt * 1000);
	}
}
