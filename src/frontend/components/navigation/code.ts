import { LitElement, PropertyValueMap, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { updateContentRevision } from "../../rpc";
import type { Frame } from "../context";

@customElement("i6q-code")
export class Code extends LitElement {
	@property({ type: String })
	url = "";

	@property({ type: String })
	value = "";

	private editCB(e: Event) {
		if (e.target) {
			this.value = (e.target as any).value;
			const mainFrame = document.body.querySelector(
				"main > section > i6q-frame",
			);
			if (mainFrame) {
				//mainFrame.innerHTML = this.value;
			}
		}
	}

	firstUpdated(props: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
		super.firstUpdated(props);
		const mainFrame = document.body.querySelector<Frame>(
			"main > section > i6q-frame",
		);
		if (mainFrame && !this.value) {
			this.value = JSON.stringify(mainFrame.serialize());
		}
	}

	async save() {
		const uri = window.location.pathname;

		const h = document.querySelector<HTMLElement>("main h1");
		const title = h?.innerText || "New Entry";
		const html = this.value;
		await updateContentRevision(uri, html, title);
		window.location.assign(window.location.pathname);
	}

	render() {
		return html`
		<i6q-edit-bar @save=${this.save} />
		<sl-textarea rows=25 @input=${this.editCB} value=${this.value}></textarea>`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"i6q-code": Code;
	}
}
