import { html, css, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { typographicStyles } from "../styles/typographic";
import { getLessonState } from "../../rpc";
import { repeat } from "lit/directives/repeat.js";

@customElement("wn-lesson-panel")
export class LessonPanel extends LitElement {
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
	line-height: 1.4rem;
}

a > sl-icon {
	position: relative;
	top: 2px;
	margin-right: 0.5rem;
}
`,
	];

	constructor() {
		super();
		this._lessonStateChange = this.lessonStateChange.bind(this);
	}

	connectedCallback() {
		super.connectedCallback();
		document.addEventListener("lessonStateChange", this._lessonStateChange);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		document.removeEventListener("lessonStateChange", this._lessonStateChange);
	}

	private _lessonStateChange: () => void;
	private lessonStateChange = () => {
		this.requestUpdate();
	};

	render() {
		const lessonState = getLessonState();
		if (!lessonState) {
			return html``;
		}

		return html`<section>
<h6>Lesson</h6>
${repeat(
	lessonState.members.entries(),
	(a) => a[0],
	(a) =>
		html`<wn-lesson-member socket="${a[0]}" role="${a[1]}"></wn-lesson-member>`,
)}
</section>`;
	}
}
