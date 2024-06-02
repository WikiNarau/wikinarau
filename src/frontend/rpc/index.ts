import { RPCPacket, RPCQueue } from "../../common/RPC";
import type { Revision, ServerResource } from "../../common/types";

let ws: WebSocket | undefined;

const messageHandler = (v: any) => {
	const packet = JSON.parse(v.data);
	queue.handlePacket(packet);
};

const flushHandler = (packet: RPCPacket) => {
	if (!ws) {
		ws = new WebSocket(
			`${location.protocol === "https:" ? "wss:" : "ws:"}//${
				location.host
			}/api-ws`,
		);
		ws.addEventListener("message", messageHandler);
	}
	if (ws.readyState !== ws.OPEN) {
		return false;
	}
	ws.send(JSON.stringify(packet));
	return true;
};
const queue = new RPCQueue(flushHandler);

export const rpc = (fun: string, args: any): Promise<any> =>
	queue.call(fun, args);

(window as any).rpc = rpc;

export const updateContentRevision = (uri: string, content: string, commitMessage = '') =>
	queue.call("updateContentRevision", { uri, content, commitMessage });

export const uploadResource = (name: string, data: string) =>
	queue.call("uploadResource", { name, data });

export const listResources = ():Promise<ServerResource[]> => queue.call("listResources", {});

export const listRevisions = (uri: string):Promise<Revision[]> => queue.call("listRevisions", { uri });
