import { utime } from "../../common/util";
import { PrivilegeLevel } from "../User";
import { DBID, db } from "./db";

export interface DBUser {
	id: number | bigint;
	createdAt: number;
	privilegeLevel: PrivilegeLevel;
	name: string;
	email: string;
	passwordHash: string;
}

const userCreate = db.prepare(
	"INSERT INTO user (createdAt, privilegeLevel, name, email, passwordHash) VALUES (?,?,?,?,?);",
);
const userGetByEmail = db.prepare(
	"SELECT * from user WHERE email = ? LIMIT 1;",
);

export const getUserByEmail = (email: string): DBUser | null => {
	try {
		return userGetByEmail.get(email) as DBUser | null;
	} catch {
		return null;
	}
};

export const createUser = (
	data: Omit<DBUser, "id" | "createdAt">,
): DBID | null => {
	try {
		return userCreate.run(
			utime(),
			data.privilegeLevel,
			data.name,
			data.email,
			data.passwordHash,
		).lastInsertRowid;
	} catch {
		return null;
	}
};
