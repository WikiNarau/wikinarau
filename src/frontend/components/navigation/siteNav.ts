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
		margin:0 0 1rem 0;
	}

	a {
		display: block;
		vertical-align: middle;
		line-height: 1.4rem;
	}

	a > sl-icon {
		position: relative;
		top: 2px;
		margin-right: 4px;
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
		<a href="/"><sl-icon name="house"></sl-icon> Main page</a>
		<a href="/how-to"><sl-icon name="question-lg"></sl-icon> How to</a>
		<a href="/contact-us"><sl-icon name="chat-dots"></sl-icon> Contact us</a>
	</section>

	<section>
		<h6>Contribute</h6>
		<a href="/" @click=${this.createPage}><sl-icon name="file-earmark"></sl-icon> New Page</a>
		<a href="https://github.com/WikiNarau/wikinarau"><sl-icon name="github"></sl-icon> GitHub</a>
		<i6q-dialog-create-page></i6q-dialog-create-page>
	</section>`;
	}
}
