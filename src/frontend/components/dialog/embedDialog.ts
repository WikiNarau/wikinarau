import { html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { typographicStyles } from "../styles/typographic";

@customElement("wn-embed-dialog")
export class DialogEmbedPage extends LitElement {
	static styles = typographicStyles;

	@property({ type: Boolean })
	open = false;

	@query("sl-dialog")
	dialog: any;

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

	private getEmbedCode(): string {
		const url = new URL(String(document.location));
		const href = `${url.origin}${url.pathname}?embed=true`;
		const code = `<iframe src="${href}" style="width: 100%; border: none;"></iframe><script src="${url.origin}/assets/iframeResizer.js"></script>`;
		return code;
	}

	render() {
		const embed = this.getEmbedCode();
		return html`
<sl-dialog label="Embed this page somewhere else" ?open=${this.open}>
	To embed this page somewhere else please use the following HTML Code:
	<sl-input id="embedCode" readonly style="margin-top:1rem; width: calc(100% - 4rem); display: inline-block;" value=${embed}></sl-input><sl-copy-button style="font-size: 1.3rem; position: relative; top: 0.3rem;" from="embedCode.value"></sl-copy-button>
	<sl-button-group slot="footer">
		<sl-button variant="warning" @click=${this.close}><sl-icon name="x-lg" slot="prefix"></sl-icon>Close</sl-button>
	</sl-button-group>
</sl-dialog>`;
	}
}
