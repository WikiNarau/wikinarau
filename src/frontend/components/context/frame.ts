import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { EditableElement } from "../abstract";

import * as toml from "smol-toml";
import { createContext, provide } from "@lit/context";
import { updateContentRevision } from "../../rpc";
import { showWarning } from "../dialog/warning";
import { isEmbed } from "../../embed";

export type FrameState = "view" | "edit";
export const frameStateContext = createContext<FrameState>("frameState");

@customElement("wn-frame")
export class Frame extends LitElement {
	@property({ type: String })
	activeSection = "main";

	@property({ type: String })
	uri = "";

	@property({ type: String })
	meta = "{}";

	@provide({ context: frameStateContext })
	frameState: FrameState = "view";

	private changeSection(sec: string) {
		if (isEmbed) {
			sec = "main";
		}
		if (sec === this.activeSection) {
			return;
		}

		this.activeSection = sec;
		if (sec === "main") {
			const url = window.location.pathname + window.location.search;
			history.replaceState("", document.title, url);
		} else {
			const url = window.location.pathname + window.location.search + "#" + sec;
			history.replaceState("", document.title, url);
		}
		if (this.activeSection === "edit") {
			this.frameState = "edit";
		} else {
			this.frameState = "view";
		}
	}

	private dragStart(e: DragEvent) {
		e.stopPropagation();
		if (this.frameState !== "edit") {
			return;
		}
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = "move";
			if (e.target instanceof HTMLElement) {
				const editable = EditableElement.getClosestEditableElement(e.target);
				if (editable) {
					e.dataTransfer.setData("text/plain", editable.innerText);
					e.dataTransfer.setData("text/html", editable.outerHTML);
					e.dataTransfer.setData(
						"application/wikinarau",
						JSON.stringify(editable.serialize()),
					);
					editable.style.opacity = "0.01";
					const rect = editable.getBoundingClientRect();
					const ox = e.clientX - rect.x;
					const oy = e.clientY - rect.y;

					console.log(editable);
					e.dataTransfer.setDragImage(editable, ox, oy);
				}
			}
		}
	}

	sectionChange(e: CustomEvent) {
		const sec = e.detail || "main";
		if (sec) {
			this.changeSection(sec);
		}
	}

	_hashChange: () => void;
	private hashChange() {
		if (document.location.hash) {
			this.changeSection(document.location.hash.substring(1));
		}
	}

	constructor() {
		super();
		this._hashChange = this.hashChange.bind(this);
		this.hashChange();
	}

	connectedCallback() {
		super.connectedCallback();
		window.addEventListener("hashchange", this._hashChange);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		window.removeEventListener("hashchange", this._hashChange);
	}

	private getFrontmatter(): Record<string, any> {
		return {
			...JSON.parse(this.meta),
			title: this.getTitle(),
			format: "JSON",
		};
	}

	private getContentCode(): string {
		const elements = EditableElement.serializeNodes(this.childNodes);
		const content = JSON.stringify(elements);
		const frontmatter = toml.stringify(this.getFrontmatter());
		return "---\n" + frontmatter + "\n---\n" + content;
	}

	private getTitle(): string {
		const h = document.querySelector<HTMLElement>("main h1");
		return h?.innerText || "New Entry";
	}

	async save() {
		const uri = this.uri || document.location.pathname;

		try {
			await updateContentRevision(uri, this.getContentCode());
			window.location.assign(uri);
		} catch (e) {
			if (typeof e === "string") {
				showWarning("Error while saving", e);
			} else {
				showWarning(
					"Error while saving",
					"There was an error while trying to save the page, please reload or try again later.",
				);
			}
		}
	}

	newElement() {
		this.append(document.createElement("wn-stem-cell"));
	}

	render() {
		return html`
		${
			!isEmbed
				? html`<wn-page-bar activeSection=${this.activeSection} @sectionChange=${this.sectionChange}></wn-page-bar>`
				: null
		}
		${
			this.activeSection === "edit"
				? html`<wn-edit-bar @save=${this.save}></wn-edit-bar>`
				: html``
		}
		${
			this.activeSection === "history"
				? html`<wn-history uri="${this.uri}"></wn-history>`
				: html`<slot @dragstart=${this.dragStart} name="${
						this.activeSection === "code" ? "code" : ""
					}"></slot>`
		}
		${
			this.activeSection === "edit"
				? html`<sl-button variant="success" @click=${this.newElement}>
		<sl-icon slot="prefix" name="plus-lg"></sl-icon>
		New element
	</sl-button>`
				: html``
		}
		`;
	}

	static styles = css`
:host {
	display: block;
	box-sizing: border-box;
}

footer {
	display: block;
	height: 1.6rem;
	background: var(--color-primary-dark);
	box-sizing: border-box;
	border-top: solid 1px var(--color-primary);
}
`;
}
