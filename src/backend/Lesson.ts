import { randomBytes } from "crypto";
import { Socket } from "./Socket";

export type LessonRole = "teacher" | "student";

export class Lesson {
	static readonly idMap = new Map<string, Lesson>();

	public readonly members = new Map<Socket, LessonRole>();
	public readonly id: string;
	public readonly createdAt = new Date();

	static getById(id: string): Lesson | undefined {
		return Lesson.idMap.get(id);
	}

	constructor() {
		this.id = randomBytes(30).toString("base64");
	}

	private destroy() {
		Lesson.idMap.delete(this.id);
	}

	join(user: Socket, role: LessonRole) {
		this.members.set(user, role);
	}

	leave(user: Socket) {
		this.members.delete(user);
		if (this.members.size <= 0) {
			this.destroy();
		}
	}
}
