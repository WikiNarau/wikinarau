import { html, css, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("wn-user-icon")
export class UserIcon extends LitElement {
	static styles = css`
	.icon {
		font-size: 1.75rem;
	}

	.name {
		font-size: 1.2rem;
	}
`;

	render() {
		return html`<div class="icon">👤 <span class="name">Anonymous</span></div>`;
	}
}
