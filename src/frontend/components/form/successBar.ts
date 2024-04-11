import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";

@customElement("i6q-success-bar")
export class SuccessBar extends LitElement {
	@property({ type: String })
	src = "";

	@property({ type: Number })
	score = 0;

	@property({ type: Number })
	maxScore = 0;

	@query(".bar")
	bar?: HTMLElement;

	render() {
		return html`<div class="barOuter"><div class="bar" style="width: 0%"></div></div><span class="result">${this.score}/${this.maxScore}</span>`;
	}

	firstUpdated() {
		if (this.bar) {
			this.bar.offsetTop;
			const p = this.score === 0 ? 0 : this.maxScore / this.score;
			this.bar.style.width = `${(p * 100) | 0}%`;
		}
	}

	static styles = css`

:host {
	display: inline-block;
	background: var(--color-background-light);
	border: solid 2px var(--color-background-dark);
	padding:0 8px 0 5px;
	border-radius: 18px;
}

.barOuter {
	width: 12em;
	height: 1.5rem;
	border-radius: 1rem;
	background: var(--color-background-dark);
	position: relative;
	border: solid 0.2rem transparent;
	box-sizing: border-box;
	display: inline-block;
	position: relative;
	top:4px;
}

.bar {
	box-sizing: border-box;
	height: 100%;
	border-radius: 1rem;
	background: var(--color-correct);
	display: block;
	transition: width 1000ms ease-in-out;
}

.result {
	font-size: 1.35em;
	margin-left: 0.5em;
	font-weight: bold;
}
`;
}

declare global {
	interface HTMLElementTagNameMap {
		"i6q-success-bar": SuccessBar;
	}
}
