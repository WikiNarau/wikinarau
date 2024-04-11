import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("i6q-page-bar")
export class PageBar extends LitElement {
	@property({ type: String, reflect: true })
	public activeSection = "main";

	private _onHashChange: () => void;
	private onHashChange() {
		this.switchToSection((document.location.hash || "#main").substring(1));
	}

	private switchToSection(section: string) {
		switch (section) {
			case "main":
				this.switchToMain();
				break;
			case "code":
				this.switchToCode();
				break;
			case "edit":
				this.switchToEdit();
				break;
		}
	}

	constructor() {
		super();
		this._onHashChange = this.onHashChange.bind(this);
		this.onHashChange();
	}

	connectedCallback(): void {
		super.connectedCallback();
		window.addEventListener("hashchange", this._onHashChange);
	}

	private switchToMain() {
		if (this.activeSection === "main") {
			return;
		}
		this.activeSection = "main";
		window.location.hash = "";

		const main = document.querySelector("main");
		if (!main) {
			throw new Error("Can't find <main>");
		}
		main.querySelector("i6q-editor")?.remove();
		main.querySelector("i6q-code")?.remove();
	}

	private switchToEdit() {
		if (this.activeSection === "edit") {
			return;
		}
		this.switchToMain();
		this.activeSection = "edit";
		window.location.hash = "edit";

		const main = document.querySelector("main");
		if (!main) {
			throw new Error("Can't find <main>");
		}

		const mainFrame = main.querySelector("i6q-frame");
		if (!mainFrame) {
			throw new Error("Can't find <i6q-frame>");
		}
		const editor = document.createElement("i6q-editor");
		editor.innerHTML = mainFrame.innerHTML;
		mainFrame.parentElement?.insertBefore(editor, mainFrame);
	}

	private switchToCode() {
		if (this.activeSection === "code") {
			return;
		}
		this.switchToMain();
		this.activeSection = "code";
		window.location.hash = "code";

		const main = document.querySelector("main");
		if (!main) {
			throw new Error("Can't find <main>");
		}

		const mainFrame = main.querySelector("i6q-frame");
		if (!mainFrame) {
			throw new Error("Can't find <i6q-frame>");
		}
		const editor = document.createElement("i6q-code");
		editor.innerHTML = mainFrame.innerHTML;
		mainFrame.parentElement?.insertBefore(editor, mainFrame);
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
