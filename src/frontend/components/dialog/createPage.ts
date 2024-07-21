import { css, html, LitElement } from "lit";
import { customElement, query } from "lit/decorators.js";
import { typographicStyles } from "../styles/typographic";
import { titleToURI } from "../../../common/tuid";
import { updateContentRevision } from "../../rpc";
import * as toml from "smol-toml";

@customElement("wn-dialog-create-page")
export class DialogCreatePage extends LitElement {
	static styles = typographicStyles;

	@query("sl-dialog")
	dialog: any;

	@query(`sl-input[name="title"]`)
	inputTitle?: HTMLInputElement;

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

	private async create() {
		const title = this.inputTitle?.value || "";
		if (!title) {
			return;
		}
		const uri = "/wiki/" + titleToURI(title);
		if (uri.length < 5) {
			return;
		}

		const frontmatter = {
			title,
			format: "JSON",
		};
		const fm = toml.stringify(frontmatter);
		const con = `[{"T":"StemCell"}]`;
		await updateContentRevision(uri, "---\n" + fm + "\n---\n" + con);
		document.location.replace(`${uri}#edit`);
	}

	render() {
		return html`
<sl-dialog label="Create a new page">
	How should this new page be called?
	<sl-input placeholder="Title" name="title" style="margin-top:1rem;"></sl-input>
	<sl-button-group slot="footer">
		<sl-button variant="warning" @click=${this.close}><sl-icon name="x-lg" slot="prefix"></sl-icon>Close</sl-button>
		<sl-button variant="success" @click=${this.create}><sl-icon name="file-earmark-plus" slot="prefix"></sl-icon>Create</sl-button>
	</sl-button-group>
</sl-dialog>`;
	}
}
