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

export interface KeyValueEntry {
	createdAt: number;
	key: string;
	value: unknown;
}

export type KVKey = string;
export type KVSocket = string;
