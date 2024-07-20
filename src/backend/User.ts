import * as bcrypt from "bcrypt";
import { createUser, getUserByEmail } from "./Database/user";
import { DBID } from "./Database/db";

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
		const passwordHash = bcrypt.hashSync(password, 10);
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
		if (bcrypt.compareSync(password, dbUser.passwordHash)) {
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
