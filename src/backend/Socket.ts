import type { RawData, WebSocket } from "ws";
import type { Session } from "./Session";
import { Lesson, LessonRole } from "./Lesson";

import { RPCPacket, RPCQueue } from "../common/RPC";
import { Entry } from "./Entry";
import { Resource } from "./Resource";
import { getResources, getRevisionHistory, updateContentRevision } from "./db";
import { closeSocket } from "./Server";
import { User } from "./User";
import { randomBytes } from "node:crypto";

export class Socket {
	public readonly id = randomBytes(30).toString("base64");
	private readonly socket: WebSocket;
	private readonly queue: RPCQueue;
	private readonly session: Session;
	private lesson?: Lesson;

	constructor(socket: WebSocket, session: Session) {
		this.socket = socket;
		this.session = session;
		this.queue = new RPCQueue(this.flushHandler.bind(this));
		this.queue.setCallThis(this);

		this.queue.setCallHandler(
			"updateContentRevision",
			this.updateContentRevision,
		);
		this.queue.setCallHandler("listRevisions", this.listRevisions);

		this.queue.setCallHandler("uploadResource", this.uploadResource);
		this.queue.setCallHandler("listResources", this.listResources);

		this.queue.setCallHandler("getSelf", this.getSelf);
		this.queue.setCallHandler("registerUser", this.registerUser);
		this.queue.setCallHandler("loginUser", this.loginUser);
		this.queue.setCallHandler("logoutUser", this.logoutUser);

		this.queue.setCallHandler("createLesson", this.createLesson);
		this.queue.setCallHandler("joinLesson", this.joinLesson);
		this.queue.setCallHandler("leaveLesson", this.leaveLesson);

		socket.on("error", this.error.bind(this));
		socket.on("close", this.close.bind(this));
		socket.on("message", this.message.bind(this));
	}

	async call(fun: string, args: unknown): Promise<unknown> {
		return this.queue.call(fun, args);
	}

	async leaveLesson() {
		if (this.lesson) {
			this.lesson.leave(this);
			this.lesson = undefined;
		}
	}

	async createLesson() {
		const lesson = new Lesson();
		this.doJoinLesson(lesson, "teacher");
		return lesson.id;
	}

	doJoinLesson(lesson: Lesson, role: LessonRole) {
		if (this.lesson) {
			this.lesson.leave(this);
		}
		this.lesson = lesson;
		lesson.join(this, role);
	}

	async joinLesson(args: unknown) {
		if (typeof args !== "object" || !args) {
			throw "Invalid args";
		}
		if (!("lesson" in args) || typeof args.lesson !== "string") {
			throw "Invalid lesson id";
		}
		if (!("role" in args) || typeof args.role !== "string") {
			throw "Invalid role";
		}

		const { role } = args;
		if (!(role === "teacher" || role === "student")) {
			throw "Invalid role";
		}

		const lesson = Lesson.getById(args.lesson);
		if (!lesson) {
			throw "Can't find lesson";
		}

		this.doJoinLesson(lesson, role);
	}

	async registerUser(args: unknown) {
		const emailRegexp =
			/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

		if (typeof args !== "object" || !args) {
			throw "Invalid args";
		}
		if (
			!("email" in args) ||
			typeof args.email !== "string" ||
			args.email.length < 3 ||
			!emailRegexp.test(args.email)
		) {
			throw "Invalid email";
		}
		if (!("password" in args) || typeof args.password !== "string") {
			throw "Invalid password";
		}
		const user = User.create(args.password, {
			email: args.email,
			privilegeLevel: "user",
		});
		return user;
	}

	async logoutUser(_args: unknown) {
		this.session.user = undefined;
		return true;
	}

	async loginUser(args: unknown) {
		if (typeof args !== "object" || !args) {
			throw "Invalid args";
		}
		if (!("email" in args) || typeof args.email !== "string") {
			throw "Invalid email";
		}
		if (!("password" in args) || typeof args.password !== "string") {
			throw "Invalid password";
		}
		const user = User.tryToLogin(args.email, args.password);
		if (user) {
			this.session.user = user;
			await this.session.save();
		} else {
			throw "Wrong E-Mail/Password combination";
		}
		return user;
	}

	async getSelf(_args: unknown) {
		if (this.session.user) {
			return this.session.user;
		} else {
			return null;
		}
	}

	async listResources(_args: unknown) {
		return await getResources();
	}

	async listRevisions(args: unknown) {
		if (typeof args !== "object" || !args) {
			throw "Invalid args";
		}
		if (!("uri" in args) || typeof args.uri !== "string") {
			throw "Invalid uri";
		}
		return await getRevisionHistory(args.uri);
	}

	async uploadResource(args: unknown) {
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
		return Resource.create(args.name, binData);
	}

	async updateContentRevision(args: unknown) {
		if (typeof args !== "object" || !args) {
			throw "Invalid args";
		}
		if (!("uri" in args) || typeof args.uri !== "string") {
			throw "Invalid uri";
		}
		if (!("content" in args) || typeof args.content !== "string") {
			throw "Invalid content";
		}
		if (!Entry.userMayCreate(args.uri, this.session.user)) {
			throw "Insufficient permissions, only moderators or admins can edit this page.";
		}

		await updateContentRevision(
			args.uri,
			args.content,
			(args as any).commitMessage || "",
		);
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
		closeSocket(this);
	}
}
