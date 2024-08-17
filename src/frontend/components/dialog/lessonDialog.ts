import { html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { typographicStyles } from "../styles/typographic";
import {
	createLesson,
	getLessonState,
	leaveLesson,
	LessonState,
} from "../../rpc";

@customElement("wn-lesson-dialog")
export class LessonDialog extends LitElement {
	static styles = typographicStyles;

	@property({ type: Boolean })
	open = false;

	@query("sl-dialog")
	dialog: any;

	constructor() {
		super();
		this._lessonStateChange = this.lessonStateChange.bind(this);
	}

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

	private _lessonStateChange: () => void;
	private lessonStateChange = () => {
		this.requestUpdate();
	};

	connectedCallback() {
		super.connectedCallback();
		setTimeout(() => {
			this.open = true;
		}, 0);
		this.addEventListener("sl-after-hide", this.remove.bind(this));
		document.addEventListener("lessonStateChange", this._lessonStateChange);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		document.removeEventListener("lessonStateChange", this._lessonStateChange);
	}

	private getJoinURL(lessonState: LessonState): string {
		const url = new URL(String(document.location));
		return `${url.origin}${url.pathname}?joinLesson=${encodeURIComponent(lessonState.id)}`;
	}

	private async startLesson() {
		await createLesson();
	}

	private async leaveLesson() {
		await leaveLesson();
	}

	render() {
		const lessonState = getLessonState();
		return html`
<sl-dialog label="Start a lesson" ?open=${this.open}>
	${
		lessonState
			? html`<p>Please share the following URL with your students:</p>
		<sl-input id="joinURL" readonly style="margin-top:1rem; width: calc(100% - 4rem); display: inline-block;" value=${this.getJoinURL(lessonState)}></sl-input><sl-copy-button style="font-size: 1.3rem; position: relative; top: 0.3rem;" from="joinURL.value"></sl-copy-button>
		<sl-button style="margin-top:1rem;" @click=${this.leaveLesson} variant="danger">End Lesson</sl-button>
		`
			: html`<p>To start a lesson, please click the following button:</p>
		<sl-button style="margin-top:1rem;" @click=${this.startLesson} variant="primary">Start Lesson</sl-button>`
	}
	<sl-button-group slot="footer">
		<sl-button variant="warning" @click=${this.close}><sl-icon name="x-lg" slot="prefix"></sl-icon>Close</sl-button>
	</sl-button-group>
</sl-dialog>`;
	}
}
