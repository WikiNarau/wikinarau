import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Revision } from "../../../common/types";
import { listRevisions } from "../../rpc";

@customElement("wn-history")
export class History extends LitElement {
	@property({ type: String })
	uri = "";

	@state()
	private history?: Revision[];

	async refresh() {
		this.history = undefined;
		const l = await listRevisions(this.uri);
		this.history = l;
	}

	connectedCallback() {
		super.connectedCallback();
		this.refresh();
	}

	render() {
		return html`${this.history
			? this.history.map(rev => html`<wn-history-revision .revision=${rev}></wn-history-revision>`)
			: html`<div style="text-align: center; padding: 4rem 0;"><sl-spinner style="font-size: 8rem;"></sl-spinner></div>`
		}`;
	}
}
