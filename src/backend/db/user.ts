import { utime } from "../../common/util";
import { PrivilegeLevel } from "../User";
import { DBID, db } from "./db";

export interface DBUser {
	id: number | bigint;
	createdAt: number;
	privilegeLevel: PrivilegeLevel;
	email: string;
	passwordHash: string;
}

const userCreate = db.prepare(
	"INSERT INTO user (createdAt, privilegeLevel, email, passwordHash) VALUES (?,?,?,?);",
);
const userGetByEmail = db.prepare(
	"SELECT id from user WHERE email = ? LIMIT 1;",
);
const userGetById = db.prepare("SELECT * from user WHERE id = ? LIMIT 1;");

export const getUserIdByEmail = (email: string): DBID => {
	try {
		return (userGetByEmail.get(email) as any)?.id || 0;
	} catch {
		return 0;
	}
};

export const getUserById = (id: DBID): DBUser | null => {
	try {
		return userGetById.get(id) as DBUser | null;
	} catch {
		return null;
	}
};

export const createUser = (
	data: Omit<DBUser, "id" | "createdAt">,
): DBID | null => {
	try {
		const oldUser = getUserIdByEmail(data.email);
		if (oldUser) {
			return null;
		}

		return userCreate.run(
			utime(),
			data.privilegeLevel,
			data.email,
			data.passwordHash,
		).lastInsertRowid;
	} catch {
		return null;
	}
};
