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
	dt, dd {
		display: inline-block;
	}

	dt {
		font-weight: bold;
	}
`;

	private async logout() {
		await logoutUser();
	}

	render() {
		return html`
		<section>
			<dl>
				<dt>Name: </dt><dd>${this.userState?.name || ""}</dd><br>
				<dt>Level: </dt><dd>${this.userState?.privilegeLevel || ""}</dd><br>
				<dt>Member since: </dt><dd><wn-datetime timestamp=${+new Date(this.userState?.createdAt || "") / 1000}></wn-datetime></dd>
			</dl>
			<sl-button @click=${this.logout} label="Logout" variant="danger"><sl-icon name="box-arrow-right"></sl-icon> Logout</sl-button>
		</section>
		`;
	}
}
