import { css, html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { typographicStyles } from "../styles/typographic";
import type { SlInput } from "@shoelace-style/shoelace";
import { loginUser, registerUser } from "../../rpc";

@customElement("wn-register-dialog")
export class DialogRegister extends LitElement {
	static styles = [
		typographicStyles,
		css`
	.errors {
		color: #e41;
		padding: 1rem 0 0;
	}
`,
	];

	@property({ type: Boolean })
	open = false;

	@property({ type: String, reflect: false })
	errorMessage = "";

	@query("form")
	form?: HTMLFormElement;

	@query("sl-dialog")
	dialog: any;

	@query(`sl-input[name="username"]`)
	username?: SlInput;

	@query(`sl-input[name="email"]`)
	email?: SlInput;

	@query(`sl-input[name="password"]`)
	password?: SlInput;

	@query(`sl-input[name="passwordRepeat"]`)
	passwordRepeat?: SlInput;

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
	}

	private async register(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		if (this.form && !this.form.checkValidity()) {
			return;
		}

		try {
			const username = this.username?.value || "";
			const email = this.email?.value || "";
			const password = this.password?.value || "";
			const passwordRepeat = this.passwordRepeat?.value || "";

			if (!username) {
				throw "Please choose a username";
			}
			if (!email) {
				throw "Please input your E-Mail-Adress";
			}
			if (!password) {
				throw "Please choose a password";
			}
			if (!passwordRepeat) {
				throw "Please confirm your password";
			}
			if (password !== passwordRepeat) {
				throw "Passwords don't match, please check them";
			}
			await registerUser(username, email, password);
			this.close();
		} catch (e) {
			this.errorMessage = String(e);
		}
	}

	render() {
		return html`
	<form @submit=${this.register}>
		<sl-dialog label="Register" ?open=${this.open}>
			<sl-input autofocus name="username" type="text" required label="Username" placeholder="Enter your public username"></sl-input>
			<br/>
			<sl-input name="email" type="email" required label="E-Mail" placeholder="Enter your E-Mail, it will be kept private"></sl-input>
			<br/>
			<sl-input name="password" type="password" required label="Password" placeholder="Enter a password"></sl-input>
			<br/>
			<sl-input name="passwordRepeat" type="password" required label="Confirm Password" placeholder="Enter your password again"></sl-input>
			<div class="errors">${this.errorMessage}</div>
			<sl-button-group slot="footer">
			<sl-button variant="warning" @click=${this.close}><sl-icon name="x-lg" slot="prefix"></sl-icon>Cancel</sl-button>
			<sl-button variant="success" type="submit"><sl-icon name="person-add" slot="prefix"></sl-icon>Register</sl-button>
			</sl-button-group>
		</sl-dialog>
	</form>`;
	}
}
