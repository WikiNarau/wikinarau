import { html, css, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";

@customElement("wn-search-bar")
export class SearchBar extends LitElement {
	static styles = css`
input {
	display: inline-block;
	appearance: none;
	border: none;
	margin: 0.3rem 0 0 0;
	outline: none;
	font-size: 1.2rem;
	line-height: 1.35rem;
	background: transparent;
	color: #000;
	position: relative;
	border: solid 2px var(--color-background-dark);
	border-radius: 2px;
	padding: 0.25rem 2rem;
	width: 100%;
	box-sizing: border-box;
}
`;

	@property({ type: Boolean, attribute: false })
	isFocused = false;

	@property()
	value = "";

	@query("input")
	_input?: HTMLInputElement;

	private readonly _handleFocus;
	private handleFocus() {
		this.isFocused = true;
	}

	private readonly _handleBlur;
	private handleBlur() {
		this.isFocused = false;
	}

	constructor() {
		super();
		this._handleFocus = this.handleFocus.bind(this);
		this._handleBlur = this.handleBlur.bind(this);
	}

	connectedCallback() {
		super.connectedCallback();
		this.addEventListener("focus", this._handleFocus);
		this.addEventListener("blur", this._handleBlur);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.removeEventListener("focus", this._handleFocus);
		this.removeEventListener("blur", this._handleBlur);
	}

	_handleSubmit(e: Event) {
		e.preventDefault();
		const sword = this._input?.value || "";
		window.location.assign("/search/" + encodeURI(sword));
	}

	render() {
		return html`<form @submit=${this._handleSubmit}><input type="search" placeholder="Search"/></form>`;
	}
}
