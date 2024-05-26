import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { updateContentRevision } from "../../rpc";

@customElement("i6q-code")
export class Code extends LitElement {
	@property({ type: String })
	url = "";

	@property({ type: String })
	value = "";

	private editCB(e: Event) {
		if (e.target) {
			this.value = (e.target as any).value;
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
		<i6q-edit-bar @save=${this.save}></i6q-edit-bar>
		<sl-textarea rows=25 @input=${this.editCB} value=${this.value}></sl-textarea>`;
	}
}
