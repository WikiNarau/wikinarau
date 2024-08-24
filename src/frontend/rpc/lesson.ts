import { flushNow, joinLesson, leaveLesson, setCallHandler } from "./queue";

let lessonState: LessonState | null = null;

export type LessonMemberRole = "student" | "teacher";
export interface LessonState {
	id: string;
	members: Map<string, LessonMemberRole>;
}

const setLesson = async (args: unknown) => {
	if (typeof args === "object" && args && "id" in args && "members" in args) {
		const newLessonState = {
			id: args.id as string,
			members: new Map(),
		};
		for (const member of args.members as {
			id: string;
			role: LessonMemberRole;
		}[]) {
			newLessonState.members.set(member.id, member.role);
		}
		lessonState = newLessonState;
		document.dispatchEvent(new CustomEvent("lessonStateChange", {}));
	} else {
		if (lessonState) {
			lessonState = null;
			document.dispatchEvent(new CustomEvent("lessonStateChange", {}));
		}
	}
	2;
};
setCallHandler("setLesson", setLesson);

export const getLessonState = () => lessonState;

const initJoinLesson = async () => {
	const params = new URLSearchParams(document.location.search);
	const joinLessonId = params.get("joinLesson");
	if (joinLessonId) {
		console.log(joinLessonId);
		await joinLesson(joinLessonId);
	}
};
setTimeout(initJoinLesson, 0);

// That way we dont have to wait for the member to time out
window.onbeforeunload = function () {
	if (lessonState) {
		leaveLesson();
		flushNow();
	}
};
