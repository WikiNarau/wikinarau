import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { kvGet, kvSet, kvUnwatch, kvWatch } from "../../rpc";

@customElement("wn-kv-text")
export class WNKVText extends LitElement {
	@property({ type: String })
	key = "";

	@property({ type: String })
	socket = "";

	@property({ type: String })
	placeholder = "";

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
		kvWatch(this.key, this._externalChange, this.socket);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		kvUnwatch(this.key, this._externalChange, this.socket);
	}

	render() {
		const value = kvGet(this.key, this.socket) || "";
		return html`${value || this.placeholder}`;
	}
}
