import { html, css, LitElement } from "lit";
import { customElement, query } from "lit/decorators.js";
import { typographicStyles } from "../styles/typographic";

@customElement("i6q-site-nav")
export class SiteNav extends LitElement {
	static styles = [
		typographicStyles,
		css`
	section {
		padding:0.5rem 1rem;
		background: var(--color-background-light);
		box-shadow: 0px 0px 4px 1px var(--color-background-dark);
		margin:0 0 2rem 0;
	}

	a {
		display: block;
	}
`,
	];

	@query("i6q-dialog-create-page")
	dialogCreatePage: any;

	private createPage(e: Event) {
		e.preventDefault();
		this.dialogCreatePage?.show();
	}

	render() {
		return html`<section>
		<h6>Navigation</h6>
		<a href="/">Main page</a>
		<a href="/how-to">How to</a>
		<a href="/contact-us">Contact us</a>
	</section>

	<section>
		<h6>Contribute</h6>
		<a href="/" @click=${this.createPage}>Create a Page</a>
		<i6q-dialog-create-page></i6q-dialog-create-page>
	</section>`;
	}
}
