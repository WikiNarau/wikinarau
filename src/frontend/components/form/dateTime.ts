import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("wn-datetime")
export class WNDateTime extends LitElement {
	@property({ type: Number })
	timestamp = 0;

	render() {
		const now = Date.now() / 1000;
		const delta = now - this.timestamp;
		if (delta < 24 * 60 * 60) {
			const days = (delta / (24 * 60 * 60)) | 0;
			const hours = ((delta / (60 * 60)) | 0) % 24;
			const minutes = ((delta / 60) | 0) % 60;
			const seconds = (delta % 60) | 0;
			const parts: String[] = [];
			if (days > 0) {
				parts.push(`${days} day${days > 1 ? "s" : ""}`);
			}
			if (hours > 0) {
				parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
			}
			if (minutes > 0) {
				parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
			}
			if (parts.length < 1) {
				parts.push(`${seconds} second${seconds > 1 ? "s" : ""}`);
			}
			return html`${parts.join(" ")} ago`;
		}
		const date = new Date(this.timestamp * 1000);
		return html`<span>${date.toLocaleString()}</span>`;
	}
}
