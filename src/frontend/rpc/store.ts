import type { KVKey, KVSocket } from "../../common/types";

export type KVWatcher = (value: any) => void;

const watcherMap = new Map<KVSocket, Map<KVKey, KVWatcher[]>>();
const localMap = new Map<KVSocket, Map<KVKey, any>>();

const kvTriggerWatcher = (socket: KVSocket, key: KVKey, value: any) => {
	let socketMap = watcherMap.get(socket);
	if (!socketMap) {
		watcherMap.set(socket, (socketMap = new Map()));
	}

	for (const cb of socketMap.get(key) || []) {
		try {
			cb(value);
		} catch (e) {
			console.error("Exception thrown in watcher for ${socket}:${key}");
			console.error(e);
		}
	}
};

const kvSetRaw = (socket: KVSocket, key: KVKey, value: any) => {
	let socketMap = localMap.get(socket);
	if (!socketMap) {
		localMap.set(socket, (socketMap = new Map()));
	}

	socketMap.set(key, value);
	kvTriggerWatcher(socket, key, value);
};

const kvGetRaw = (socket: KVSocket, key: KVKey): any =>
	localMap.get(socket)?.get(key);

export const kvSet = (key: KVKey, value: any) => kvSetRaw("", key, value);

export const kvGet = (key: KVKey, socket: KVSocket = "") =>
	kvGetRaw(socket, key);

export const kvWatch = (cb: KVWatcher, key: KVKey, socket: KVSocket = "") => {
	let socketMap = watcherMap.get(socket);
	if (!socketMap) {
		watcherMap.set(socket, (socketMap = new Map()));
	}

	let arr = socketMap.get(key);
	if (!arr) {
		arr = [];
		socketMap.set(key, arr);
	}
	arr.push(cb);
};

export const kvUnwatch = (cb: KVWatcher, key: KVKey, socket: KVSocket = "") => {
	let socketMap = watcherMap.get(socket);
	if (!socketMap) {
		watcherMap.set(socket, (socketMap = new Map()));
	}

	let arr = socketMap.get(key);
	if (!arr) {
		return;
	}
	socketMap.set(
		key,
		arr.filter((c) => c !== cb),
	);
};
