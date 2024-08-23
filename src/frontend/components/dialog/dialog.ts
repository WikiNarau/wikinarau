import { html, LitElement, PropertyValueMap } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { typographicStyles } from "../styles/typographic";
import { SlDialog } from "@shoelace-style/shoelace";

@customElement("wn-dialog")
export class WNDialog extends LitElement {
	static styles = [typographicStyles];

	@query("sl-dialog")
	private dialog?: SlDialog;

	@property({ type: String })
	label = "";

	closeDialog() {
		this.dialog?.hide();
	}

	protected firstUpdated(
		props: PropertyValueMap<any> | Map<PropertyKey, unknown>,
	) {
		super.firstUpdated(props);
		setTimeout(() => this.dialog?.show(), 0);
	}

	render() {
		return html`<sl-dialog label="${this.label}" style="--width: 50vw;" @sl-after-hide=${this.remove}>
		<slot></slot>
	</sl-dialog>`;
	}
}

export const showDialog = (label: string, html: string) => {
	const d = new WNDialog();
	d.label = label;
	d.innerHTML = html;
	document.body.append(d);
	return d;
};
