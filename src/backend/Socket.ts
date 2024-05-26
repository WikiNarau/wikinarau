import type { RawData, WebSocket } from "ws";
import type { Server } from "./Server";
import { RPCPacket, RPCQueue } from "../common/RPC";
import { Resource } from "./Resource";

export class Socket {
	private readonly server: Server;
	private readonly socket: WebSocket;
	private readonly queue: RPCQueue;

	constructor(server: Server, socket: WebSocket) {
		this.server = server;
		this.socket = socket;
		this.queue = new RPCQueue(this.flushHandler.bind(this));
		this.queue.setCallThis(this);
		this.queue.setCallHandler("getSelf", this.getSelf);
		this.queue.setCallHandler(
			"updateContentRevision",
			this.updateContentRevision,
		);
		this.queue.setCallHandler("uploadResource", this.uploadResource);
		this.queue.setCallHandler("listResources", this.listResources);

		socket.on("error", this.error.bind(this));
		socket.on("close", this.close.bind(this));
		socket.on("message", this.message.bind(this));
	}

	getSelf(_args: unknown) {
		return "Someone!";
	}

	listResources(_args: unknown) {
		return this.server.db.getResources();
	}

	uploadResource(args: unknown) {
		if (typeof args !== "object" || !args) {
			throw "Invalid args";
		}
		if (!("name" in args) || typeof args.name !== "string") {
			throw "Invalid name";
		}
		if (args.name.charAt(0) === ".") {
			throw "Invalid name";
		}
		if (!("data" in args) || typeof args.data !== "string") {
			throw "Invalid data";
		}
		const comma = args.data.indexOf(",");
		if (comma < 0) {
			throw "Invalid base64uri";
		}
		const binData = Buffer.from(args.data.substring(comma), "base64url");
		return Resource.create(this.server.db, args.name, binData);
	}

	updateContentRevision(args: unknown) {
		if (typeof args !== "object" || !args) {
			throw "Invalid args";
		}
		if (!("uri" in args) || typeof args.uri !== "string") {
			throw "Invalid uri";
		}
		if (!("content" in args) || typeof args.content !== "string") {
			throw "Invalid content";
		}

		this.server.db.updateContentRevision(args.uri, args.content);
		return true;
	}

	message(data: RawData) {
		try {
			const packet = JSON.parse(data.toString());
			this.queue.handlePacket(packet);
		} catch (e) {
			console.error(e);
		}
	}

	flushHandler(packet: RPCPacket) {
		if (this.socket.readyState !== this.socket.OPEN) {
			return false;
		}
		this.socket.send(JSON.stringify(packet));
		return true;
	}

	error(e: any) {
		console.error(e);
	}

	close() {
		this.server.closeSocket(this);
	}
}
