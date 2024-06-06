import { LitElement, PropertyValueMap } from "lit";
import { generateTypeUID } from "../../../common/tuid";
import {
	SerializedElement,
	renderJSONElement,
} from "../../../common/contentTypes";
import { consume } from "@lit/context";
import { type FrameState, frameStateContext } from "../context";
import { property } from "lit/decorators.js";

export interface ContentTypeDefinition {
	cons: () => EditableElement;
	name: string;
	icon: string;
}

export const contentTypes = new Set<ContentTypeDefinition>();

export abstract class EditableElement extends LitElement {
	@consume({ context: frameStateContext, subscribe: true })
	@property({ attribute: false })
	protected frameState?: FrameState;

	static tagName(): string {
		return "error";
	}

	abstract serialize(): SerializedElement;

	static getClosestEditableElement(
		e: HTMLElement | null,
	): EditableElement | null {
		if (!e) {
			return null;
		} else if (e instanceof EditableElement) {
			return e;
		} else {
			return this.getClosestEditableElement(e.parentElement);
		}
	}

	static serializeNodes(e: NodeListOf<ChildNode>): SerializedElement[] {
		let ret: SerializedElement[] = [];
		for (const n of e) {
			switch (n.nodeType) {
				case Node.TEXT_NODE: {
					const t = (n.textContent || "").trim();
					if (t) {
						ret.push({ T: "", text: t });
					}
					break;
				}
				case Node.ELEMENT_NODE: {
					if ((n as HTMLElement).tagName.toUpperCase() === "WN-CODE") {
						continue;
					}
					ret.push(EditableElement.serializeElement(n as HTMLElement));
					break;
				}
				default:
					break;
			}
		}
		return ret;
	}

	private static serializeHTMLProps(ele: HTMLElement): Record<string, any> {
		const ret: Record<string, any> = {};
		switch (ele.tagName) {
			case "A":
				const a = ele as HTMLAnchorElement;
				if (a.href) {
					ret.href = a.href;
				}
				if (a.target) {
					ret.target = a.target;
				}
				break;
			case "IMG":
				const img = ele as HTMLImageElement;
				if (img.src) {
					ret.src = img.src;
				}
				if (img.width) {
					ret.width = img.width;
				}
				if (img.height) {
					ret.height = img.height;
				}
				break;
		}
		return ret;
	}

	static serializeElement(ele: HTMLElement): SerializedElement {
		if (ele instanceof EditableElement) {
			return ele.serialize();
		}
		const props = EditableElement.serializeHTMLProps(ele);
		return {
			T: ele.tagName.toLowerCase(),
			C: EditableElement.serializeNodes(ele.childNodes),
			...props,
		};
	}

	_removeHandler: (e: Event) => void;
	removeHandler(e: Event) {
		e.stopPropagation();
		e.preventDefault();
		this.dispatchEditEvent();
		this.remove();
	}

	_newElementHandler: (e: Event) => void;
	newElement(e: Event) {
		e.stopPropagation();
		e.preventDefault();
		const ele = document.createElement("wn-stem-cell");
		let id = generateTypeUID("MCO");
		for (let i = 0; i < 100; i++) {
			if (!document.querySelector(`#${id}`)) {
				break;
			}
		}
		ele.id = id;
		this.before(ele);
	}

	constructor() {
		super();
		this._removeHandler = this.removeHandler.bind(this);
		this._newElementHandler = this.newElement.bind(this);

		this._dragEnd = this.dragEnd.bind(this);

		this._dragOver = this.dragOver.bind(this);
		this._drop = this.drop.bind(this);
	}

	_dragEnd: (e: DragEvent) => void;
	dragEnd(e: DragEvent) {
		if (this.frameState !== "edit") {
			return;
		}
		e.stopPropagation();
		if (e.dataTransfer?.dropEffect === "move") {
			e.preventDefault();
			this.dispatchEditEvent();
			this.remove();
		}
	}

	_dragOver: (e: DragEvent) => void;
	dragOver(e: DragEvent) {
		if (this.frameState !== "edit") {
			return;
		}
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = "move";
		}
	}

	private dropSerializedElement(ele: SerializedElement) {
		const div = document.createElement("DIV");
		const html = renderJSONElement(ele);
		div.innerHTML = html;
		for (const childEle of div.children) {
			this.before(childEle);
		}
	}

	private dropWikinarau(raw: string) {
		const data = JSON.parse(raw);
		if (Array.isArray(data)) {
			while (data.length > 0) {
				this.dropSerializedElement(data.pop());
			}
		} else {
			this.dropSerializedElement(data);
		}
		this.dispatchEditEvent();
	}

	_drop: (e: DragEvent) => void;
	drop(e: DragEvent) {
		if (this.frameState !== "edit") {
			return;
		}
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = "move";

			const wikiData = e.dataTransfer.getData("application/wikinarau");
			if (wikiData) {
				e.preventDefault();
				e.stopPropagation();
				this.dropWikinarau(wikiData);
			}
		}
	}

	connectedCallback() {
		super.connectedCallback();

		this.addEventListener("remove", this._removeHandler);
		this.addEventListener("newElement", this._newElementHandler);

		this.setAttribute("droppable", "true");
		this.addEventListener("dragend", this._dragEnd);
		this.addEventListener("dragover", this._dragOver);
		this.addEventListener("drop", this._drop);
	}

	protected updated(props: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
		super.updated(props);
		if (this.frameState === "edit") {
			this.setAttribute("droppable", "true");
		} else {
			this.removeAttribute("droppable");
		}
	}

	disconnectedCallback() {
		this.removeEventListener("remove", this._removeHandler);
		this.removeEventListener("newElement", this._newElementHandler);

		this.removeEventListener("dragend", this._dragEnd);
		this.removeEventListener("dragover", this._dragOver);
		this.removeEventListener("drop", this._drop);
	}

	dispatchEditEvent() {
		this.dispatchEvent(
			new CustomEvent("wn-edit", {
				bubbles: true,
				composed: true,
			}),
		);
	}
}
