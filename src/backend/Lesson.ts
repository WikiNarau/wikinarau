import { randomBytes } from "crypto";
import { Socket } from "./Socket";

export type LessonRole = "teacher" | "student";

export class Lesson {
	static readonly idMap = new Map<string, Lesson>();

	public readonly members = new Map<Socket, LessonRole>();
	public readonly id: string;
	public readonly createdAt = new Date();

	static getById(id: string): Lesson | undefined {
		console.log(Lesson.idMap);
		console.log(id);
		return Lesson.idMap.get(id);
	}

	constructor() {
		this.id = randomBytes(30).toString("base64");
		Lesson.idMap.set(this.id, this);
	}

	private destroy() {
		Lesson.idMap.delete(this.id);
	}

	private syncState() {
		const members = [];
		for (const [socket, role] of this.members.entries()) {
			members.push({ role, id: socket.id });
		}
		for (const socket of this.members.keys()) {
			socket.call("setLesson", {
				id: this.id,
				members,
			});
		}
	}

	join(user: Socket, role: LessonRole) {
		this.members.set(user, role);
		this.syncState();
	}

	leave(user: Socket) {
		this.members.delete(user);
		if (this.members.size <= 0) {
			this.destroy();
		}
		user.call("setLesson", null);
		this.syncState();
	}
}
