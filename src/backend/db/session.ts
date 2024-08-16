import type { DBSession } from "../Session";
import { db } from "./db";

const sessionCreate = db.prepare(
	"INSERT OR REPLACE INTO session (createdAt, token, user) VALUES (?,?,?);",
);
const sessionGet = db.prepare("SELECT * from session WHERE token = ? LIMIT 1;");

export const getSession = async (id: string): Promise<DBSession | null> => {
	try {
		return sessionGet.get(id) as DBSession | null;
	} catch {
		return null;
	}
};

export const setSession = async (
	id: string,
	data: DBSession,
): Promise<string | null> => {
	try {
		sessionCreate.run(data.createdAt, id, data.user);
		return id;
	} catch {
		return null;
	}
};
