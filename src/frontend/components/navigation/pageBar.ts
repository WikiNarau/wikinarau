import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("wn-page-bar")
export class PageBar extends LitElement {
	@property({ type: String })
	public activeSection = "main";

	private switchToMain() {
		this.dispatchEvent(
			new CustomEvent("sectionChange", {
				detail: "main",
				bubbles: true,
				composed: true,
			}),
		);
	}

	private switchToEdit() {
		this.dispatchEvent(
			new CustomEvent("sectionChange", {
				detail: "edit",
				bubbles: true,
				composed: true,
			}),
		);
	}

	private switchToCode() {
		this.dispatchEvent(
			new CustomEvent("sectionChange", {
				detail: "code",
				bubbles: true,
				composed: true,
			}),
		);
	}

	private switchToHistory() {
		this.dispatchEvent(
			new CustomEvent("sectionChange", {
				detail: "history",
				bubbles: true,
				composed: true,
			}),
		);
	}

	/*
	<iframe src="http://localhost:2600/wiki/berry?embed=true" style="width: 100%; border: none;"></iframe>
	<script src="http://localhost:2600/assets/iframeResizer.js"></script>
	*/
	private showEmbedLink() {
		const dialog = document.createElement("wn-embed-dialog-page");
		document.body.append(dialog);
	}

	render() {
		return html`
			<nav>
				<span class="left">
					<wn-button @click=${this.switchToMain} class="narrow flat ${
						this.activeSection === "main" ? "active" : ""
					}"><sl-icon name="file-text"></sl-icon><span class="button-text"> Content</span></wn-button>
				</span>
				<span class="right">
					<wn-button @click=${this.showEmbedLink} class="narrow flat">
						<sl-icon name="window" style="position: relative; top:2px;"></sl-icon><span class="button-text"> Embed</span>
					</wn-button>
					<wn-button @click=${this.switchToHistory} class="narrow flat ${
						this.activeSection === "history" ? "active" : ""
					}">
						<sl-icon name="clock-history" style="position: relative; top:2px;"></sl-icon><span class="button-text"> History</span>
					</wn-button>
					<wn-button @click=${this.switchToCode} class="narrow flat ${
						this.activeSection === "code" ? "active" : ""
					}">λ<span class="button-text"> Code</span></wn-button>
					<wn-button @click=${this.switchToEdit} class="narrow flat ${
						this.activeSection === "edit" ? "active" : ""
					}"><sl-icon name="pencil"></sl-icon><span class="button-text"> Edit</span></wn-button>
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
	color: var(--sl-color-primary-700);
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
	margin-right:0;
}

@media only screen and (max-width: 470px) {
	.button-text {
		display: none;
	}
}
`;
}

declare global {
	interface HTMLElementTagNameMap {
		"wn-pagebar": PageBar;
	}
}
