import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { updateContentRevision } from "../../rpc";
import { EditableElement } from "../abstract";

@customElement("i6q-editor")
export class Editor extends LitElement {
	@property({ type: String })
	url = "";

	private _editCB: () => void;

	constructor() {
		super();
		this._editCB = this.editCB.bind(this);
	}

	private editCB() {
		setTimeout(() => {
			const mainFrame = document.body.querySelector(
				"main > section > i6q-frame",
			);
			if (mainFrame) {
				mainFrame.innerHTML = this.innerHTML;
			}
		}, 0);
	}

	connectedCallback() {
		super.connectedCallback();
		this.addEventListener("i6q-edit", this._editCB);
		if (!this.innerHTML) {
			const mainFrame = document.body.querySelector(
				"main > section > i6q-frame",
			);
			if (mainFrame) {
				this.innerHTML = mainFrame.innerHTML;
			}
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.removeEventListener("i6q-edit", this._editCB);
	}

	async save() {
		const uri = window.location.pathname;
		const h = document.querySelector<HTMLElement>("main h1");
		const title = h?.innerText || "New Entry";
		const con = JSON.stringify(EditableElement.serializeNodes(this.childNodes));
		await updateContentRevision(uri, con, title);
		window.location.assign(window.location.pathname);
	}

	newElement() {
		this.append(document.createElement("i6q-stem-cell"));
	}

	render() {
		return html`
		<i6q-edit-bar @save=${this.save} />
		<i6q-frame section="main">
			<slot></slot>
			<sl-button variant="success" @click=${this.newElement}>
				<sl-icon slot="prefix" name="plus-lg"></sl-icon>
				New element
			</sl-button>
		</i6q-frame>`;
	}

	static styles = css`
		.left {
			float: left;
		}
		.right {
			float: right;
		}
		.edit-bar {
			display: table;
			width:100%;
			margin-bottom: 1rem;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		"i6q-editor": Editor;
	}
}
