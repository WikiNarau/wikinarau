import fs from "node:fs";
import crypto from "node:crypto";
import { Database } from "./Database";

export class Resource {
	private uri: string;

	constructor(uri: string) {
		this.uri = uri;
	}

	getPublicUri(): string {
		return `/res/${this.uri}`;
	}

	static init() {
		fs.mkdirSync("./data/res", { recursive: true });
	}

	static determineFileType(ext: string) {
		switch (ext.toLowerCase()) {
			case "jpg":
			case "jpeg":
			case "png":
			case "gif":
			case "avif":
			case "bmp":
			case "svg":
				return "image";
			case "mp4":
			case "webm":
			case "mkv":
			case "avi":
				return "video";
			case "mp3":
			case "m4a":
			case "ogg":
			case "opus":
			case "wav":
			case "mid":
			case "midi":
				return "audio";
			case "pdf":
			case "djvu":
			case "doc":
				return "document";
			default:
				return "unknown";
		}
	}

	static create(db: Database, name: string, data: Buffer) {
		const checksum = crypto.createHash("sha512").update(data).digest("hex");
		const pathSum = checksum.substring(0, 8);
		fs.mkdirSync(`./data/res/${pathSum}`, { recursive: true });
		fs.writeFileSync(`./data/res/${pathSum}/${name}`, data);
		const uri = `/res/${pathSum}/${name}`;
		const dot = name.lastIndexOf(".");
		const ext = dot > 0 ? name.substring(dot + 1) : "";
		const fileType = Resource.determineFileType(ext);
		const fileName = dot > 0 ? name.substring(0, dot) : name;
		const id = db.createResource(uri, fileName, ext, checksum, fileType);
		return {
			uri,
			id,
		};
	}
}
