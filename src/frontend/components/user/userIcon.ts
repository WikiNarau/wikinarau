import { consume } from "@lit/context";
import { html, css, LitElement } from "lit";
import { customElement, query } from "lit/decorators.js";
import { UserState, userStateContext } from "../context";
import { DialogLogin } from "../dialog";
import type { SlDrawer } from "@shoelace-style/shoelace";

@customElement("wn-user-icon")
export class UserIcon extends LitElement {
	@consume({ context: userStateContext, subscribe: true })
	protected userState?: UserState;

	@query("sl-drawer.user-drawer")
	drawer?: SlDrawer;

	static styles = css`
	:host {
		padding: 0.4rem 0;
		display: block;
	}

	.name {
		font-size: 1.2rem;
		line-height: 1.35em;
		vertical-align: bottom;
		margin-left: 0.25rem;
	}

	sl-icon {
		font-size: 1.75rem;
		vertical-align: middle;
		margin-right: 0.25rem;
	}

	div {
		cursor: pointer;
		user-select: none;
	}

	@media only screen and (max-width: 960px) {
		.name {
			display: none;
		}
	}
`;

	private openModal() {
		if (this.userState) {
			this.toggleNavigation();
		} else {
			document.body.append(new DialogLogin());
		}
	}

	private toggleNavigation() {
		if (!this.drawer) {
			throw new Error("Can't query sl-drawer.navigation-drawer");
		}
		if (this.drawer.open) {
			this.drawer.hide();
		} else {
			this.drawer.show();
		}
	}

	render() {
		const name = this.userState
			? html`<wn-kv-text key="userName" placeholder="Anonymous"></wn-kv-text>`
			: html`Login`;
		const iconName = this.userState ? "person" : "box-arrow-in-right";
		if (!this.userState && this.drawer && this.drawer.open) {
			this.drawer.hide();
		}
		return html`
		<div @click=${this.openModal}>
			<sl-icon name="${iconName}"></sl-icon><span class="name">${name}</span>
		</div>
		<sl-drawer class="user-drawer" label="User Menu" placement="end">
			<wn-user-menu></wn-user-menu>
		</sl-drawer>
		`;
	}
}
