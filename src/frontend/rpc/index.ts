import { RPCPacket, RPCQueue } from "../../common/RPC";

let ws: WebSocket | undefined;

const messageHandler = (v: any) => {
	const packet = JSON.parse(v.data);
	queue.handlePacket(packet);
};

const flushHandler = (packet: RPCPacket) => {
	if (!ws) {
		ws = new WebSocket(`ws://${location.host}/api-ws`);
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

export const updateContentRevision = (
	uri: string,
	content: string,
) => queue.call("updateContentRevision", { uri, content });

export const uploadResource = (name: string, data: string) =>
	queue.call("uploadResource", { name, data });

export const listResources = () =>
	queue.call("listResources", { });
