import { KVPermissions } from "../../common/types";
import { db } from "./db";

const kvCreate = db.prepare(
	"INSERT INTO userKVEntry (user, key, createdAt, permissions, value) VALUES (?,?,?,?,?);",
);
const kvUpdate = db.prepare(
	"UPDATE userKVEntry SET createdAt = ?, permissions = ?, value = ? WHERE id = ?;",
);
const kvGet = db.prepare(
	"SELECT * from userKVEntry WHERE user = ? AND key = ? LIMIT 1;",
);
const kvGetAll = db.prepare("SELECT * from userKVEntry WHERE user = ?;");

export interface DBKVEntry {
	id: number;
	user: number;
	key: string;

	createdAt: number;
	permissions: number;
	value: string;
}

export const kvGetEntry = async (
	user: number,
	key: string,
): Promise<DBKVEntry | null> => {
	try {
		return kvGet.get(user, key) as DBKVEntry | null;
	} catch {
		return null;
	}
};

export const kvGetAllEntries = async (user: number): Promise<DBKVEntry[]> => {
	try {
		return kvGetAll.all(user) as DBKVEntry[];
	} catch {
		return [];
	}
};

export const kvSetEntry = async (
	user: number,
	key: string,
	permissions: KVPermissions,
	value: string,
): Promise<void> => {
	try {
		const old = await kvGetEntry(user, key);
		if (old) {
			kvUpdate.run(+Date.now(), permissions, value, old.id);
		} else {
			kvCreate.run(user, key, +Date.now(), permissions, value);
		}
	} catch {
		return;
	}
};
