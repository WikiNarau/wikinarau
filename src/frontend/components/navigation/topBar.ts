import { SlDrawer } from "@shoelace-style/shoelace";
import { LitElement, css, html } from "lit";
import { customElement, query } from "lit/decorators.js";

@customElement("i6q-topbar")
export class TopBar extends LitElement {

	@query("sl-drawer.navigation-drawer")
	drawer?: SlDrawer;

	private toggleNavigation() {
		if(!this.drawer){
			throw new Error("Can't query sl-drawer.navigation-drawer");
		}
		if(this.drawer.open){
			this.drawer.hide();
		} else {
			this.drawer.show();
		}
	}


	render() {
		return html`
<div class="bar">
	<aside class="left">
		<a href="/" class="home" aria-label="Home">
			<img class="logo" src="/assets/logo.svg?v=1" alt="WikiLearn" />
		</a>
		<sl-icon-button @click=${this.toggleNavigation} class="mobile-nav" name="list" label="Show Navigation"></sl-icon-button>
		<sl-drawer class="navigation-drawer" label="Navigation" placement="start">
			<a href="/" class="home" aria-label="Home">
				<img class="logo" src="/assets/logo.svg?v=1" alt="WikiLearn" />
			</a>
			<br/>
			<i6q-site-nav noBoxShadow></i6q-site-nav>
		</sl-drawer>
	</aside>
	<section>
		<i6q-search-bar></i6q-search-bar>
	</section>
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

.bar {
	padding: 0 1rem;
	box-sizing: border-box;
	margin:0 auto;
	position: relative;
	width: 100%;
	max-width: 1600px;
}

.bar > .left {
	float: left;
}

.bar > .right {
	float: right;
}

.bar > aside {
	width: 180px;
}

.bar > section {
	margin:0 auto;
	position: relative;
	width: calc(100% - 180px - 180px - 1rem - 1rem);
	padding:0;
}

img.logo {
	display: block;
	width: 100%;
	height: 2.5rem;
	object-fit: contain;
	margin-top: 0.25rem;
}

.mobile-nav {
	display: none;
	font-size: 2.5rem;
	margin-top: 0.1rem;
}

.mobile-nav::part(base) {
	padding: 0;
}

@media only screen and (max-width: 960px) {
	.bar > aside {
		width: 32px;
	}

	.bar > section {
		margin:0 auto;
		position: relative;
		width: calc(100% - 32px - 32px - 1rem - 1rem);
		padding:0;
	}

	aside > a.home {
		display: none;
	}

	.mobile-nav {
		display: inline-block;
	}
}
`;
}

declare global {
	interface HTMLElementTagNameMap {
		"i6q-topbar": TopBar;
	}
}
