import fs from "node:fs";
import sqlite from "better-sqlite3";

export type DBID = number | bigint;

fs.mkdirSync("./data/", { recursive: true });
export const db = new sqlite("./data/main.sqlite3");

export const userVersion = (): number => {
	const { user_version } = (db.pragma("user_version;") as any[])[0];
	return user_version;
};

export const setUserVersion = (v: number) => {
	db.pragma(`user_version = ${v};`);
};

const applyDBMigrations = () => {
	db.pragma("journal_mode=WAL;");
	const migrations = fs
		.readdirSync("./src/backend/database/migrations/")
		.sort(
			(a, b) =>
				parseInt(a.split(".").shift() || "0") -
				parseInt(b.split(".").shift() || "0"),
		);
	for (const m of migrations) {
		const newVer = parseInt(m.split(".").shift() || "0");
		const curVer = userVersion();
		if (curVer >= newVer) {
			continue;
		}
		if (newVer !== curVer + 1) {
			throw new Error(
				`Can't apply migrations, expected ${curVer + 1} but got ${newVer}`,
			);
		}
		const sql = fs.readFileSync(
			`./src/backend/database/migrations/${m}`,
			"utf-8",
		);
		db.exec(sql);
		setUserVersion(newVer);
	}
};
applyDBMigrations();
