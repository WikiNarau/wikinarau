import { css, html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { typographicStyles } from "../styles/typographic";
import type { SlInput } from "@shoelace-style/shoelace";
import { loginUser } from "../../rpc";

@customElement("wn-login-dialog")
export class DialogLogin extends LitElement {
	static styles = [
		typographicStyles,
		css`
	.errors {
		color: #e41;
	}		
`,
	];

	@property({ type: Boolean })
	open = false;

	@property({ type: String, reflect: false })
	errorMessage = "";

	@query("sl-dialog")
	dialog: any;

	@query(`sl-input[name="email"]`)
	email?: SlInput;

	@query(`sl-input[name="password"]`)
	password?: SlInput;

	public show() {
		if (this.dialog && this.dialog.show) {
			this.dialog.show();
		}
	}

	public close() {
		if (this.dialog && this.dialog.hide) {
			this.dialog.hide();
		}
	}

	connectedCallback() {
		super.connectedCallback();
		setTimeout(() => {
			this.open = true;
		}, 0);
		this.addEventListener("sl-after-hide", this.remove.bind(this));
		this.addEventListener("sl-after-show", () => this.email?.focus());
	}

	private async login(e: Event) {
		e.preventDefault();
		e.stopPropagation();

		try {
			const user = await loginUser(
				this.email?.value || "",
				this.password?.value || "",
			);
			if (user) {
				this.errorMessage = "";
				this.close();
			}
		} catch (e) {
			this.errorMessage = String(e);
		}
	}

	render() {
		return html`
	<form @submit=${this.login}>
<sl-dialog label="Login" ?open=${this.open}>
		<sl-input name="email" type="email" required label="E-Mail"></sl-input>
		<br/>
		<sl-input name="password" type="password" required label="Password"></sl-input>
		<div class="errors">${this.errorMessage}</div>
		<sl-button-group slot="footer">
			<sl-button variant="warning" @click=${this.close}>Cancel</sl-button>
			<sl-button variant="success" type="submit">Login</sl-button>
		</sl-button-group>
	
</sl-dialog>
</form>`;
	}
}
