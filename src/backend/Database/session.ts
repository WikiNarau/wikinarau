import type { DBSession } from "../Session";
import { db } from "./db";

const sessionCreate = db.prepare(
	"INSERT INTO session (createdAt, token) VALUES (?,?);",
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
		sessionCreate.run(data.createdAt, id);
		return id;
	} catch {
		return null;
	}
};
