import { LitElement, PropertyValueMap } from "lit";
import { generateTypeUID } from "../../../common/tuid";
import {
	SerializedElement,
	renderJSONElement,
} from "../../../common/contentTypes";
import { consume } from "@lit/context";
import { type FrameState, frameStateContext } from "../context";
import { property, state } from "lit/decorators.js";

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

	@state()
	protected dropStatus: "" | "before" | "after" = "";

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
					const ele = (n.textContent || "").trim();
					if (ele) {
						ret.push(ele);
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

		this._dragLeave = this.dragLeave.bind(this);
		this._dragEnd = this.dragEnd.bind(this);
		this._dragOver = this.dragOver.bind(this);
		this._drop = this.drop.bind(this);
	}

	_dragEnd: (e: DragEvent) => void;
	private dragEnd(e: DragEvent) {
		if (this.frameState !== "edit") {
			return;
		}
		this.style.opacity = "";
		e.stopPropagation();
		e.stopPropagation();
		if (e.dataTransfer?.dropEffect === "move") {
			e.preventDefault();
			this.dispatchEditEvent();
			this.remove();
		}
		this.dropStatus = "";
	}

	_dragOver: (e: DragEvent) => void;
	private dragOver(e: DragEvent) {
		if (this.frameState !== "edit") {
			return;
		}
		const hasWikiData = e.dataTransfer?.types.includes("application/wikinarau");
		if (!hasWikiData) {
			return;
		}
		e.preventDefault();
		e.stopPropagation();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = "move";
		}
		const rect = this.getBoundingClientRect();
		const halfPoint = (rect.height || 1) / 2;
		const y = e.clientY - rect.top;
		if (y < halfPoint) {
			this.dropStatus = "before";
		} else {
			this.dropStatus = "after";
		}
	}

	_dragLeave: (e: DragEvent) => void;
	private dragLeave(_e: DragEvent) {
		this.dropStatus = "";
	}

	private dropSerializedElement(ele: SerializedElement) {
		const div = document.createElement("DIV");
		const html = renderJSONElement(ele);
		div.innerHTML = html;
		if (this.dropStatus === "after") {
			for (const childEle of div.children) {
				this.after(childEle);
			}
		} else {
			for (const childEle of div.children) {
				this.before(childEle);
			}
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
			console.log(this.dropStatus);

			const wikiData = e.dataTransfer.getData("application/wikinarau");
			if (wikiData) {
				e.preventDefault();
				e.stopPropagation();
				this.dropWikinarau(wikiData);
				this.dropStatus = "";
			}
		}
	}

	connectedCallback() {
		super.connectedCallback();

		this.addEventListener("remove", this._removeHandler);
		this.addEventListener("newElement", this._newElementHandler);

		this.addEventListener("dragend", this._dragEnd);
		this.addEventListener("dragover", this._dragOver);
		this.addEventListener("dragenter", this._dragOver);
		this.addEventListener("dragleave", this._dragLeave);
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

	protected maybeUnshuffleChildren() {
		// Abort if there are no children
		if (this.children.length === 0) {
			return;
		}

		// If there is no original-order specified then the children shouldn't be shuffled.
		if (!this.children[0].getAttribute("original-order")) {
			return;
		}

		// First we determine how big an array we need
		let max = 0;
		for (const ele of this.children) {
			max = Math.max(max, parseInt(ele.getAttribute("original-order") || "0"));
		}

		// Then we put the elements into the array, in the original-order
		const arr = new Array(max);
		for (const ele of this.children) {
			const i = parseInt(ele.getAttribute("original-order") || "0");
			arr[i] = ele;
		}

		// Then we append the elements, one by one, thereby restoring the original order
		for (const ele of arr) {
			this.append(ele);
		}
	}

	protected maybeShuffleChildren() {
		// Abort if there are no children
		if (this.children.length === 0) {
			return;
		}
		// Assume they are already shuffled if original-order is set on the first child.
		// New children should only appear after editing, which also clears the original-order attribute.
		if (this.children[0].getAttribute("original-order")) {
			return;
		}

		let i = 0;
		for (const ele of this.children) {
			ele.setAttribute("original-order", String(i++));
		}

		// Shuffle a couple of times, this is probably overly cautious
		for (let ii = 0; ii < 4; ii++) {
			for (const ele of this.children) {
				if (Math.random() < 0.5) {
					this.prepend(ele);
				} else {
					this.append(ele);
				}
			}
		}
	}

	disconnectedCallback() {
		this.removeEventListener("remove", this._removeHandler);
		this.removeEventListener("newElement", this._newElementHandler);

		this.removeEventListener("dragend", this._dragEnd);
		this.removeEventListener("dragover", this._dragOver);
		this.removeEventListener("dragenter", this._dragOver);
		this.removeEventListener("dragleave", this._dragLeave);
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
