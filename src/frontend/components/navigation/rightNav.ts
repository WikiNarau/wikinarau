import { html, css, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { typographicStyles } from "../styles/typographic";

@customElement("wn-right-nav")
export class RightNav extends LitElement {
	static styles = [
		typographicStyles,
		css`
section {
	padding:0.5rem 1rem;
	background: var(--color-background-light);
	box-shadow: 0px 0px 4px 1px var(--color-background-dark);
	margin:0 0 1rem 0;
}

section.noBoxShadow {
	box-shadow: none;
}

a {
	display: block;
	line-height: 1.4rem;
}

a > sl-icon {
	position: relative;
	top: 2px;
	margin-right: 0.5rem;
}
`,
	];

	@property({ type: Boolean })
	noboxshadow = false;

	private showEmbedLink(e: Event) {
		e.preventDefault();
		const dialog = document.createElement("wn-embed-dialog");
		document.body.append(dialog);
	}

	private showLessonDialog(e: Event) {
		e.preventDefault();
		const dialog = document.createElement("wn-lesson-dialog");
		document.body.append(dialog);
	}

	private showPrintDialog(e: Event) {
		e.preventDefault();
		window.print();
	}

	render() {
		return html`<section class="${this.noboxshadow ? "noBoxShadow" : ""}">
		<h6>Use this page</h6>
		<a @click=${this.showLessonDialog} href=""><sl-icon name="mortarboard"></sl-icon>Teach</a>
		<a @click=${this.showEmbedLink} href=""><sl-icon name="window"></sl-icon>Embed</a>
		<a @click=${this.showPrintDialog} href=""><sl-icon name="printer"></sl-icon>Print</a>
	</section>`;
	}
}
