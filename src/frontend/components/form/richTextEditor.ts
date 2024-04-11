import { html, css, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("i6q-rich-text-editor")
export class RichTextEditor extends LitElement {
	static styles = css`

`;

	@property({ type: String, reflect: true })
	value = "";

	_change: (e: Event) => void;
	change(e: Event) {
		console.log(e);
	}

	constructor() {
		super();
		this._change = this.change.bind(this);
	}

	render() {
		return html`<h1>RTE</h1>`;
	}
}
