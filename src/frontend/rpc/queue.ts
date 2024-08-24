import { RPCPacket, RPCQueue } from "../../common/RPC";
import type { Revision, ServerResource } from "../../common/types";

let ws: WebSocket | undefined;

const messageHandler = (v: any) => queue.handlePacket(JSON.parse(v.data));

export let socketID = "";

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
			ws.addEventListener("close", () => {
				ws = undefined;
				socketID = "";
			});
			ws.addEventListener("error", (e) => {
				console.log(e);
				ws = undefined;
				socketID = "";
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
	handler: (v: unknown) => unknown | Promise<unknown>,
) => queue.setCallHandler(name, handler);

setCallHandler("setSocketID", (args: unknown) => {
	if (typeof args === "string") {
		socketID = args;
	}
});

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

export const kvEntryGetAll = () =>
	queue.call("kvEntryGetAll", { createdAt: 0 });

export const loginUser = async (email: string, password: string) => {
	const user = await queue.call("loginUser", { email, password });
	window.dispatchEvent(
		new CustomEvent("userChange", {
			bubbles: true,
			composed: true,
			detail: user,
		}),
	);
	await kvEntryGetAll();
	return user;
};

export const registerUser = async (email: string, password: string) =>
	await queue.call("registerUser", { email, password });

export const logoutUser = async () => {
	await queue.call("logoutUser", {});
	localStorage.clear();
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

export const kvEntrySet = (
	key: string,
	permissions: number,
	value: string,
	createdAt: number,
) => queue.call("kvEntrySet", { key, permissions, value, createdAt });
