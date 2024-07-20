import { consume } from "@lit/context";
import { html, css, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { UserState, userStateContext } from "../context";
import { logoutUser } from "../../rpc";

@customElement("wn-user-menu")
export class UserMenu extends LitElement {
	@consume({ context: userStateContext, subscribe: true })
	protected userState?: UserState;

	static styles = css`
	
`;

	private async logout() {
		await logoutUser();
	}

	render() {
		const name = this.userState?.name || "";
		return html`
		<div>
			<sl-button @click=${this.logout} label="Logout" variant="danger"><sl-icon name="box-arrow-right"></sl-icon> Logout</sl-button>
		</div>
		`;
	}
}
