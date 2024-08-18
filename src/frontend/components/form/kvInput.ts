import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { kvGet, kvSet, kvUnwatch, kvWatch } from "../../rpc";

@customElement("wn-kv-input")
export class WNKVInput extends LitElement {
	@property({ type: String })
	key = "";

	@property({ type: String })
	label = "";

	@property({ type: Number })
	permissions = 0;

	_externalChange: () => void;
	externalChange() {
		this.requestUpdate();
	}

	constructor() {
		super();
		this._externalChange = this.externalChange.bind(this);
	}

	connectedCallback() {
		super.connectedCallback();
		kvWatch(this.key, this._externalChange);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		kvUnwatch(this.key, this._externalChange);
	}

	change(e: InputEvent) {
		const input = e.target as HTMLInputElement;
		kvSet(this.key, input.value, this.permissions);
	}

	render() {
		const value = kvGet(this.key) || "";
		return html`<sl-input @sl-input=${this.change} placeholder="${this.label}" type="text" .value=${value}></sl-input>`;
	}
}
