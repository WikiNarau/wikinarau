import type { EditableElement } from "../frontend/components/abstract";

export interface SerializedElement {
	T: string;
	C?: SerializedElement[];
	[key: string]: any;
}

export interface ContentTypeDefinition {
	cons: () => EditableElement;
	name: string;
	icon: string;
}

export const contentTypes = new Set<ContentTypeDefinition>();
