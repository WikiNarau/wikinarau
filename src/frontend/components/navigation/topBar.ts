import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("i6q-topbar")
export class TopBar extends LitElement {
	render() {
		return html`
			<div class="center">
				<div class="center-left">
					<a href="/" class="home" aria-label="Home"><img src="/assets/logo.svg?v=1" alt="WikiLearn" /></a>
				</div>
				<div class="center-center">
					<i6q-search-bar />
				</div>
				<div class="center-right">

				</div>
			</div>
		`;
	}

	static styles = css`
	:host {
		display: block;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 3rem;
		background: var(--color-background-light);
		border-bottom: solid 2px var(--color-primary);
		box-shadow: 0px 0px 4px 1px var(--color-background-dark);
		z-index:10;
	}

	.center {
		width: 100%;
		max-width: 1280px;
		margin: 0 auto;
		padding: 0 2rem;
		box-sizing: border-box;
		display: block;
		min-height: 1rem;
		position: relative;
	}

	.center-center {
		width: 100%;
		max-width: 924px;
		margin: 0 auto;
		box-sizing: border-box;
		display: block;
		min-height: 1rem;
	}

	img {
		height: 100%;
		width: auto;
		height: 1.5rem;
		margin-top: 0.7rem;
	}

	.center-left {
		display: inline-block;
		position: absolute;
		left: 0;
		top: 0;
		padding-left: 1rem;
		box-sizing: border-box;
	}

	.center-right {
		display: inline-block;
		position: absolute;
		right: 0;
		top: 0;
		padding-right: 1rem;
		box-sizing: border-box;
	}

`;
}

declare global {
	interface HTMLElementTagNameMap {
		"i6q-topbar": TopBar;
	}
}
