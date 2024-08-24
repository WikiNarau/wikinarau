import type {
	KeyValueEntry,
	KVKey,
	KVPermissions,
	KVSocket,
} from "../../common/types";
import { kvEntrySet, setCallHandler, socketID } from "./queue";

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
	if (!socket && socketID) {
		kvTriggerWatcher(socketID, key, value);
	}
};

const kvSetLocal = (socket: KVSocket, key: KVKey, value: any) =>
	localStorage.setItem(`WNKV|${socket}|${key}`, JSON.stringify(value));

const kvSetRaw = (
	socket: KVSocket,
	key: KVKey,
	value: any,
	permissions: KVPermissions,
	createdAt: number,
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

const kvGetRaw = (socket: KVSocket, key: KVKey): any => {
	if (socket === socketID) {
		return kvGetRaw("", key);
	} else {
		return localMap.get(socket)?.get(key)?.value;
	}
};

export const kvSet = (
	key: KVKey,
	value: any,
	permissions: KVPermissions,
	createdAt = +new Date(),
) => {
	kvSetRaw("", key, value, permissions, createdAt);
	kvEntrySet(key, permissions, value, createdAt);
};

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

setCallHandler("kvEntrySet", (args: unknown) => {
	if (typeof args !== "object" || !args) {
		throw "Invalid args";
	}
	if (!("key" in args) || typeof args.key !== "string") {
		throw "Invalid key";
	}
	if (!("createdAt" in args) || typeof args.createdAt !== "number") {
		throw "Invalid createdAt";
	}
	if (!("permissions" in args) || typeof args.permissions !== "number") {
		throw "Invalid permission bits";
	}
	if (!("value" in args) || typeof args.value !== "string") {
		throw "Invalid value";
	}

	console.log(args);
	kvSetRaw("", args.key, args.value, args.permissions, args.createdAt);
});
