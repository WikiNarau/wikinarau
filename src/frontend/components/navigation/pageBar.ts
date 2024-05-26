import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("i6q-page-bar")
export class PageBar extends LitElement {
	@property({ type: String })
	public activeSection = "main";

	private switchToMain() {
		this.dispatchEvent(new CustomEvent("sectionChange", {detail: "main", bubbles: true, composed: true}));
	}

	private switchToEdit() {
		this.dispatchEvent(new CustomEvent("sectionChange", {detail: "edit", bubbles: true, composed: true}));
	}

	private switchToCode() {
		this.dispatchEvent(new CustomEvent("sectionChange", {detail: "code", bubbles: true, composed: true}));
	}

	render() {
		return html`
			<nav>
				<span class="left">
					<i6q-button @click=${this.switchToMain} class="narrow flat ${
						this.activeSection === "main" ? "active" : ""
					}">🗏 Content</i6q-button>
				</span>
				<span class="right">
					<i6q-button @click=${this.switchToCode} class="narrow flat ${
						this.activeSection === "code" ? "active" : ""
					}">λ Code</i6q-button>
					<i6q-button @click=${this.switchToEdit} class="narrow flat ${
						this.activeSection === "edit" ? "active" : ""
					}">🖍 Edit</i6q-button>
				</span>
			</nav>
			<div class="border"></div>
		`;
	}

	static styles = css`
	:host {
		display: block;
		margin-bottom: 1rem;
	}

	.border {
		width:100%;
		position: absolute;
		left:0;
		width:100%;
		height:2px;
		background: var(--sl-color-primary-600);
	}

	nav {
		display: table;
		width: 100%;
	}

	.left {
		float:left;
	}

	.right {
		float:right;
	}

	.left > * {
		margin-right: 12px;
	}

	.right > * {
		margin-left: 12px;
	}

	a {
		text-decoration: none;
		color: var(--color-primary);
		display: inline-block;
		margin: 0 1rem;
		padding: 6px 0;
		font-size: 1.2rem;
	}

	a.active {
		text-decoration: underline;
	}

	a:first-child {
		margin-left:0;
	}
	a:last-child {
		margin-right1:0;
	}
`;
}

declare global {
	interface HTMLElementTagNameMap {
		"i6q-pagebar": PageBar;
	}
}
