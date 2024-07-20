import { ServerResource } from "../../common/types";
import { utime } from "../../common/util";
import { db } from "./db";

const resourceCreate = db.prepare(
	"INSERT INTO resource (createdAt, path, extension, hash, name, type) VALUES (?,?,?,?,?,?);",
);
const resourceGetAll = db.prepare("SELECT * from resource;");

export const getResources = async (): Promise<ServerResource[]> => {
	return resourceGetAll.all() as ServerResource[];
};

export const createResource = async (
	path: string,
	name: string,
	ext: string,
	hash: string,
	type: string,
) => {
	resourceCreate.run(utime(), path, name, ext, hash, type);
	return path;
};
