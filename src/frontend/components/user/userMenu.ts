import { consume } from "@lit/context";
import { html, css, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { UserState, userStateContext } from "../context";
import { logoutUser } from "../../rpc";
import { KVPermissionBits } from "../../../common/types";

@customElement("wn-user-menu")
export class UserMenu extends LitElement {
	@consume({ context: userStateContext, subscribe: true })
	protected userState?: UserState;

	static styles = css`
		td, th {
			text-align: left;
			padding: 0.25rem;
		}
`;

	private async logout() {
		await logoutUser();
	}

	render() {
		return html`
		<section>
			<table>
				<tr><th>Name:</th><td><wn-kv-input permissions=${KVPermissionBits.Public} label="Anonymous" key="userName"></wn-kv-input></td></tr>
				<tr><th>Type:</th><td>${this.userState?.privilegeLevel || ""}</td></tr>
				<tr><th>Member since:</th><td><wn-datetime timestamp=${+new Date(this.userState?.createdAt || "") / 1000}></wn-datetime></td></tr>
			</table>
			<sl-button @click=${this.logout} label="Logout" variant="danger"><sl-icon name="box-arrow-right"></sl-icon> Logout</sl-button>
		</section>
		`;
	}
}
