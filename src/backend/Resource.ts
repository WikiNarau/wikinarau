import fs from "node:fs/promises";
import crypto from "node:crypto";
import { createResource } from "./database";

export interface DBResource {
	createdAt: number;
	name: string;
	type: string;
	ext: string;
	hash: string;
}

export class Resource {
	private uri: string;

	constructor(uri: string) {
		this.uri = uri;
	}

	getPublicUri(): string {
		return `/res/${this.uri}`;
	}

	static async init() {
		await fs.mkdir("./data/res", { recursive: true });
	}

	static determineFileType(ext: string) {
		switch (ext.toLowerCase()) {
			case "jpg":
			case "jpeg":
			case "png":
			case "apng":
			case "gif":
			case "avif":
			case "bmp":
			case "svg":
			case "tiff":
			case "tga":
			case "webp":
				return "image";
			case "mp4":
			case "webm":
			case "mkv":
			case "avi":
			case "mkv":
			case "wmv":
			case "mov":
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

	static async create(name: string, data: Buffer) {
		const checksum = crypto.createHash("sha512").update(data).digest("hex");
		const pathSum = checksum.substring(0, 8);

		await fs.mkdir(`./data/res/${pathSum}`, { recursive: true });
		await fs.writeFile(`./data/res/${pathSum}/${name}`, data);
		const uri = `/res/${pathSum}/${name}`;
		const dot = name.lastIndexOf(".");
		const ext = dot > 0 ? name.substring(dot + 1) : "";
		const fileType = Resource.determineFileType(ext);
		const fileName = dot > 0 ? name.substring(0, dot) : name;
		const id = await createResource(uri, fileName, ext, checksum, fileType);
		return {
			uri,
			id,
		};
	}
}
