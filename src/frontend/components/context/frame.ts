import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { WSElementSync } from "../../sync";
import { EditableElement } from "../abstract";
import { SerializedElement } from "../../../common/contentTypes";

import {createContext, provide} from '@lit/context';
import { updateContentRevision } from "../../rpc";
export type FrameState = "view" | "edit";
export const frameStateContext = createContext<FrameState>('frameState');

@customElement("i6q-frame")
export class Frame extends LitElement {
	sync?: WSElementSync;

	@property({type: String})
	activeSection = "main";

	@provide({context: frameStateContext})
	frameState: FrameState = "view";

	private code = '';

	private changeSection(sec: string) {
		this.activeSection = sec;
		if(sec === "main"){
			const url = window.location.pathname + window.location.search;
			history.replaceState("", document.title, url);
		} else {
			const url = window.location.pathname + window.location.search + "#" + sec;
			history.replaceState("", document.title, url);
		}
		if(this.activeSection === "edit"){
			this.frameState = "edit";
		} else {
			this.frameState = "view";
		}
	}

	sectionChange(e: CustomEvent) {
		const sec = e.detail || '';
		if(sec){
			this.changeSection(sec);
		}
	}

	_hashChange:() => void;
	hashChange() {
		if(document.location.hash){
			this.changeSection(document.location.hash.substring(1));
		}
	}

	constructor(){
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
		const pageBar = html`<i6q-page-bar activeSection=${this.activeSection} @sectionChange=${this.sectionChange}></i6q-page-bar>`;
		switch(this.activeSection){
		default:
		case "main":
			return html`${pageBar}<slot></slot>`;
		case "edit":
			return html`${pageBar}
			<i6q-edit-bar @save=${this.save}></i6q-edit-bar>
			<slot></slot>
			<sl-button variant="success" @click=${this.newElement}>
				<sl-icon slot="prefix" name="plus-lg"></sl-icon>
				New element
			</sl-button>`;
		case "code":
			if(!this.code){
				this.code = JSON.stringify(this.serialize());
			}
			return html`${pageBar}
			<i6q-code value=${this.code}></i6q-code>`;
		}
	}

	serialize(): SerializedElement[] {
		return EditableElement.serializeNodes(this.childNodes);
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

declare global {
	interface HTMLElementTagNameMap {
		"i6q-frame": Frame;
	}
}
