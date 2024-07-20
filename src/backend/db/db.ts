import fs from "node:fs";
import sqlite from "better-sqlite3";
import { initSQLTables } from "./migrations";

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
	if (userVersion() < 1) {
		db.exec(initSQLTables);
		setUserVersion(1);
	}
};
applyDBMigrations();
