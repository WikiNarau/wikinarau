import { html, css, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { typographicStyles } from "../styles/typographic";
import { LessonMemberRole } from "../../rpc";

@customElement("wn-lesson-member")
export class LessonMember extends LitElement {
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

	@property({ type: String })
	socket = "";

	@property({ type: String })
	role: LessonMemberRole = "student";

	render() {
		const iconName =
			this.role === "teacher" ? "person-fill-exclamation" : "person-fill";
		const ph = this.role === "teacher" ? "Teacher" : "Student";
		return html`<div><sl-icon name="${iconName}"></sl-icon><wn-kv-text socket="${this.socket}" key="userName" placeholder="${ph}"></wn-kv-text></div>`;
	}
}
