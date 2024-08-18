import { permission } from "process";
import type {
	KeyValueEntry,
	KVKey,
	KVPermissions,
	KVSocket,
} from "../../common/types";

export type KVWatcher = (value: any) => void;

const watcherMap = new Map<KVSocket, Map<KVKey, KVWatcher[]>>();
const localMap = new Map<KVSocket, Map<KVKey, KeyValueEntry>>();

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

const kvSetLocal = (socket: KVSocket, key: KVKey, value: any) =>
	localStorage.setItem(`WNKV|${socket}|${key}`, JSON.stringify(value));

const kvSetRaw = (
	socket: KVSocket,
	key: KVKey,
	value: any,
	permissions: number,
	createdAt = +new Date(),
) => {
	if (!key) {
		return;
	}

	let socketMap = localMap.get(socket);
	if (!socketMap) {
		localMap.set(socket, (socketMap = new Map()));
	}

	const entry = {
		createdAt,
		permissions,
		value,
	};
	socketMap.set(key, entry);
	kvTriggerWatcher(socket, key, value);
	kvSetLocal(socket, key, entry);
};

const kvGetRaw = (socket: KVSocket, key: KVKey): any =>
	localMap.get(socket)?.get(key)?.value;

export const kvSet = (key: KVKey, value: any, permissions: KVPermissions) =>
	kvSetRaw("", key, value, permissions);

export const kvGet = (key: KVKey, socket: KVSocket = "") =>
	kvGetRaw(socket, key);

export const kvWatch = (key: KVKey, cb: KVWatcher, socket: KVSocket = "") => {
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

export const kvUnwatch = (key: KVKey, cb: KVWatcher, socket: KVSocket = "") => {
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

const initLocalMap = () => {
	for (const rawKey of Object.keys(localStorage)) {
		const parts = rawKey.split("|");
		if (parts.length !== 3) {
			continue;
		}
		const [magic, socket, key] = parts;
		if (magic !== "WNKV") {
			continue;
		}
		const value = localStorage.getItem(rawKey);
		if (value) {
			try {
				const entry = JSON.parse(value) as KeyValueEntry;
				kvSetRaw(socket, key, entry.value, entry.permissions, entry.createdAt);
			} catch {
				// Rmove invalid entries
				localStorage.removeItem(rawKey);
			}
		}
	}
};
initLocalMap();
