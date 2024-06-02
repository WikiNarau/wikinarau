import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("wn-datetime")
export class WNDateTime extends LitElement {
	@property({ type: Number })
	timestamp = 0;

	render() {
		const date = new Date(this.timestamp*1000);
		return html`<span>${date.toLocaleString()}</span>`;
	}
}
