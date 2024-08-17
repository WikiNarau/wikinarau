import { RPCPacket, RPCQueue } from "../../common/RPC";
import type { Revision, ServerResource } from "../../common/types";

let ws: WebSocket | undefined;

const messageHandler = (v: any) => {
	const packet = JSON.parse(v.data);
	queue.handlePacket(packet);
};

let lastConnectionAttempt = 0;
const flushHandler = (packet: RPCPacket) => {
	if (!ws) {
		const now = +new Date();
		// Only try at most once every 10 seconds to establish a connection
		if (now - lastConnectionAttempt < 10 * 1000) {
			return false;
		}
		lastConnectionAttempt = now;
		setTimeout(async () => {
			await fetch("/api-session", { method: "POST" });
			ws = new WebSocket(
				`${location.protocol === "https:" ? "wss:" : "ws:"}//${
					location.host
				}/api-ws`,
			);
			ws.addEventListener("message", messageHandler);
			ws.addEventListener("close", () => (ws = undefined));
			ws.addEventListener("error", (e) => {
				console.log(e);
				ws = undefined;
			});
		}, 0);
	} else if (ws.readyState === ws.OPEN) {
		ws.send(JSON.stringify(packet));
		return true;
	}
	return false;
};
const queue = new RPCQueue(flushHandler);

export const setCallHandler = (
	name: string,
	handler: (v: unknown) => Promise<unknown>,
) => queue.setCallHandler(name, handler);

export const flushNow = () => queue.flush();

export const rpc = (fun: string, args: any): Promise<any> =>
	queue.call(fun, args);

(window as any).rpc = rpc;

export const updateContentRevision = (
	uri: string,
	content: string,
	commitMessage = "",
) => queue.call("updateContentRevision", { uri, content, commitMessage });

export const getSelf = () => queue.call("getSelf", {});

export const loginUser = async (email: string, password: string) => {
	const user = await queue.call("loginUser", { email, password });
	window.dispatchEvent(
		new CustomEvent("userChange", {
			bubbles: true,
			composed: true,
			detail: user,
		}),
	);
	return user;
};

export const registerUser = async (
	name: string,
	email: string,
	password: string,
) => {
	const user = await queue.call("registerUser", { name, email, password });
	return user;
};

export const logoutUser = async () => {
	await queue.call("logoutUser", {});
	window.dispatchEvent(
		new CustomEvent("userChange", {
			bubbles: true,
			composed: true,
			detail: undefined,
		}),
	);
};

export const uploadResource = (name: string, data: string) =>
	queue.call("uploadResource", { name, data });

export const listResources = (): Promise<ServerResource[]> =>
	queue.call("listResources", {});

export const listRevisions = (uri: string): Promise<Revision[]> =>
	queue.call("listRevisions", { uri });

export const createLesson = (): Promise<string> =>
	queue.call("createLesson", {});
export const joinLesson = (id: string, role = "student"): Promise<void> =>
	queue.call("joinLesson", { lesson: id, role });
export const leaveLesson = (): Promise<void> => queue.call("leaveLesson", {});
