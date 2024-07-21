import { css, html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { typographicStyles } from "../styles/typographic";
import type { SlInput } from "@shoelace-style/shoelace";
import { loginUser } from "../../rpc";
import { DialogRegister } from "./registerDialog";

@customElement("wn-login-dialog")
export class DialogLogin extends LitElement {
	static styles = [
		typographicStyles,
		css`
	.errors {
		color: #e41;
		padding: 1rem 0 0;
	}

	.comment {
		font-style: italic;
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
	}

	private register(e: Event) {
		e.preventDefault();
		e.stopPropagation();

		this.open = false;
		document.body.append(new DialogRegister());
	}

	private async login(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		if (this.form && !this.form.checkValidity()) {
			return;
		}

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
			<sl-input autofocus name="email" type="email" required label="E-Mail" placeholder="Enter your E-Mail-Adress"></sl-input>
			<br/>
			<sl-input name="password" type="password" required label="Password" placeholder="Enter your password"></sl-input>
			<div class="errors">${this.errorMessage}</div>
			<div class="comment">Don't have an account?</div>
			<sl-button variant="primary" slot="footer" style="float:left" @click=${this.register}><sl-icon name="person-add" slot="prefix"></sl-icon>Join now</sl-button>
			<sl-button-group slot="footer">
				<sl-button variant="warning" @click=${this.close}><sl-icon name="x-lg" slot="prefix"></sl-icon>Cancel</sl-button>
				<sl-button variant="success" type="submit"><sl-icon name="box-arrow-in-right" slot="prefix"></sl-icon>Login</sl-button>
			</sl-button-group>
		</sl-dialog>
	</form>`;
	}
}
