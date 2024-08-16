import { createUser, getUserByEmail } from "./db/user";
import { DBID } from "./db/db";
import { hashPasswordSync, comparePasswordSync } from "./db";

export type PrivilegeLevel = "admin" | "moderator" | "user";

export interface DBUser {
	id: DBID;
	email: string;
	privilegeLevel: PrivilegeLevel;
	name: string;
	passwordHash: string;
	createdAt: number;
}

export class User {
	public readonly id: DBID;
	public readonly email: string;
	public readonly privilegeLevel: PrivilegeLevel;
	public name: string;
	public readonly createdAt: Date;

	static create(
		password: string,
		data: Omit<DBUser, "id" | "passwordHash" | "createdAt">,
	): User {
		const oldUser = getUserByEmail(data.email);
		if (oldUser) {
			throw "E-Mail is already in use, please use a different one";
		}

		const passwordHash = hashPasswordSync(password);
		const id = createUser({ ...data, passwordHash });
		const dbUser = getUserByEmail(data.email);
		if (!dbUser) {
			throw new Error(`Error while creating user: ${JSON.stringify(data)}`);
		}
		return new User(dbUser);
	}

	static tryToLogin(email: string, password: string): User | null {
		const dbUser = getUserByEmail(email);
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
		this.name = data.name;
		this.createdAt = new Date(data.createdAt * 1000);
	}
}
