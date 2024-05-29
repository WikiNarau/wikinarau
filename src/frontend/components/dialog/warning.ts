import { html, css, LitElement, PropertyValueMap } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { typographicStyles } from "../styles/typographic";
import { SlDialog } from "@shoelace-style/shoelace";

@customElement("i6q-warning-dialog")
export class WarningDialog extends LitElement {
	static styles = [
		typographicStyles,
		css`

`,
	];

	@query("sl-dialog")
	private dialog?: SlDialog;

	@property({type: String})
	label = "Warning";

	closeDialog() {
		this.dialog?.hide();
	}

	afterHide() {
		console.log("after hide");
	}

	protected firstUpdated(props: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
		super.firstUpdated(props);
		setTimeout(() => this.dialog?.show() ,0);
	}

	render() {
		return html`<sl-dialog label="${this.label}" @sl-after-hide=${this.remove}>
		<slot></slot>
		<sl-button-group slot="footer">
			<sl-button variant="warning"  @click=${this.closeDialog}>Close</sl-button>
		</sl-button-group>
	</sl-dialog>`;
	}
}

export const showWarning = (label: string, text: string) => {
	const d = new WarningDialog();
	d.label = label;
	d.innerText = text;
	document.body.append(d);
};