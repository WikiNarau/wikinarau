export interface ServerResource {
	createdAt: number;
	ext: string;
	path: string;
	hash: string;
	name: string;
	type: string;
}

export interface Revision {
	id: string;
	createdAt: number;
	content: string;
	uri: string;
	commitMessage?: string;
}

export type KVPermissions = number;
export const KVPermissionBits = {
	Admin: 32,
	Public: 16,

	GroupMod: 8,
	Group: 4,

	Teacher: 2,
	Lesson: 1,
};

export interface KeyValueEntry {
	createdAt: number;
	permissions: KVPermissions;
	value: any;
}

export type KVKey = string;
export type KVSocket = string;
