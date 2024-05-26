import { LitElement } from "lit";
import { generateTypeUID } from "../../../common/tuid";
import { SerializedElement } from "../../../common/contentTypes";
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
					if ((n as HTMLElement).tagName.toUpperCase() === "I6Q-CODE") {
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

	_moveUpHandler: (e: Event) => void;
	moveUpHandler(e: Event) {
		e.stopPropagation();
		e.preventDefault();
		const ele = this.previousElementSibling;
		if (!ele) {
			return;
		}
		ele.before(this);
	}

	_moveDownHandler: (e: Event) => void;
	moveDownHandler(e: Event) {
		e.stopPropagation();
		e.preventDefault();
		const ele = this.nextElementSibling;
		if (!ele) {
			return;
		}
		ele.after(this);
	}

	_newElementHandler: (e: Event) => void;
	newElement(e: Event) {
		e.stopPropagation();
		e.preventDefault();
		const ele = document.createElement("i6q-stem-cell");
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
		this._moveUpHandler = this.moveUpHandler.bind(this);
		this._moveDownHandler = this.moveDownHandler.bind(this);
		this._newElementHandler = this.newElement.bind(this);

		this._dragStart = this.dragStart.bind(this);
		this._dragEnd = this.dragEnd.bind(this);

		this._dragOver = this.dragOver.bind(this);
		this._drop = this.drop.bind(this);
	}

	_dragStart: (e: DragEvent) => void;
	dragStart(e: DragEvent) {
		e.stopPropagation();
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = "move";
			e.dataTransfer.setData("text/html", this.outerHTML);
		}
	}

	_dragEnd: (e: DragEvent) => void;
	dragEnd(e: DragEvent) {
		e.stopPropagation();
		console.log(e.dataTransfer);
		if (e.dataTransfer?.dropEffect === "move") {
			e.preventDefault();
			this.dispatchEditEvent();
			this.remove();
		}
	}

	_dragOver: (e: DragEvent) => void;
	dragOver(e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = "move";
		}
	}

	_drop: (e: DragEvent) => void;
	drop(e: DragEvent) {
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = "move";
			const data = e.dataTransfer.getData("text/html");
			if (data) {
				e.preventDefault();
				e.stopPropagation();
				const ele = document.createElement("DIV");
				ele.innerHTML = data;
				for (const childEle of ele.children) {
					this.before(childEle);
				}
				this.dispatchEditEvent();
			}
		}
	}

	connectedCallback() {
		super.connectedCallback();

		this.addEventListener("remove", this._removeHandler);
		this.addEventListener("moveUp", this._moveUpHandler);
		this.addEventListener("moveDown", this._moveDownHandler);
		this.addEventListener("newElement", this._newElementHandler);

		this.setAttribute("droppable", "true");
		this.addEventListener("dragstart", this._dragStart);
		this.addEventListener("dragend", this._dragEnd);

		this.addEventListener("dragover", this._dragOver);
		this.addEventListener("drop", this._drop);
	}

	disconnectedCallback() {
		this.removeEventListener("remove", this._removeHandler);
		this.removeEventListener("moveUp", this._moveUpHandler);
		this.removeEventListener("moveDown", this._moveDownHandler);
		this.removeEventListener("newElement", this._newElementHandler);

		this.removeEventListener("dragstart", this._dragStart);
		this.removeEventListener("dragend", this._dragEnd);

		this.removeEventListener("dragover", this._dragOver);
		this.removeEventListener("drop", this._drop);
	}

	dispatchEditEvent() {
		this.dispatchEvent(
			new CustomEvent("i6q-edit", {
				bubbles: true,
				composed: true,
			}),
		);
	}
}
