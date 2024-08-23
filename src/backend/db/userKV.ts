import { KVPermissions } from "../../common/types";
import { db, DBID } from "./db";

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
	id: DBID;
	user: DBID;
	key: string;

	createdAt: number;
	permissions: number;
	value: string;
}

export const kvGetEntry = async (
	user: DBID,
	key: string,
): Promise<DBKVEntry | null> => {
	try {
		return kvGet.get(user, key) as DBKVEntry | null;
	} catch {
		return null;
	}
};

export const kvGetAllEntries = async (user: DBID): Promise<DBKVEntry[]> => {
	try {
		return kvGetAll.all(user) as DBKVEntry[];
	} catch {
		return [];
	}
};

export const kvSetEntry = async (
	user: DBID,
	key: string,
	permissions: KVPermissions,
	value: string,
	createdAt = +Date.now(),
): Promise<void> => {
	try {
		const old = await kvGetEntry(user, key);
		if (old) {
			kvUpdate.run(createdAt, permissions, value, old.id);
		} else {
			kvCreate.run(user, key, createdAt, permissions, value);
		}
	} catch {
		return;
	}
};
