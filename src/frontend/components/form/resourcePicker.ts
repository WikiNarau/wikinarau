import { html, css, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { uploadResource } from "../../rpc";
import { typographicStyles } from "../styles";

@customElement("i6q-resource-picker")
export class ResourcePicker extends LitElement {
	static styles = [
		typographicStyles,
		css`
	input {
		display: inline-block;
		appearance: none;
		border: none;
		margin: 0.3rem 0 0 0;
		outline: none;
		font-size: 1.2rem;
		line-height: 1.35rem;
		background: transparent;
		color: #000;
		position: relative;
		border: solid 2px var(--color-background-dark);
		border-radius: 2px;
		padding: 0.25rem 2rem;
		width: 100%;
		box-sizing: border-box;
	}

	audio {
		width: 100%;
	}

	video {
		width: 100%;
		height: auto;
		max-height: 400px;
	}

	img {
		display: block;
		width: 100%;
		height: auto;
		max-height: 400px;
		object-fit: contain;
	}
`,
	];

	@query("sl-dialog")
	chooseDialog?: any;

	@query("i6q-resource-list")
	resourceList?: any;

	@query("input")
	input?: HTMLInputElement;

	@property({ type: String })
	accept: string = "";

	@property({ type: String, reflect: true })
	src: string = "";

	change() {
		if (!this.input) {
			return;
		}
		const { files } = this.input;
		if (!files || files.length < 1) {
			return;
		}
		const file = files[0];

		const reader = new FileReader();
		reader.onload = async (e) => {
			const content = e.target?.result;
			if (!content) {
				return;
			}
			const uri = await uploadResource(file.name, content as string);
			const detail = uri;
			this.dispatchEvent(
				new CustomEvent("change", { bubbles: true, composed: true, detail }),
			);
		};
		reader.readAsDataURL(file); // Very simple solution, should be replaced with a better, binary one instead
	}

	upload() {
		if (this.input) {
			this.input.click();
		}
	}

	renderResource() {
		if (!this.src) {
			return html`<p>Please upload or pick a file</p>`;
		}
		switch (this.accept) {
			case "video":
				return html`<video src=${this.src} controls></video>`;
			case "audio":
				return html`<audio src=${this.src} controls></audio>`;
			case "image":
				return html`<img src=${this.src}/>`;
		}
	}

	chooseUpload() {
		this.chooseDialog?.show();
		this.resourceList?.refresh();
	}

	removeUpload() {
		this.src = "";
	}

	closeChooseDialog() {
		this.chooseDialog?.hide();
	}

	resourcePick(e: CustomEvent) {
		e.stopPropagation();
		e.preventDefault();
		const detail = e.detail;
		if (!detail || !detail.path) {
			return;
		}
		this.src = detail.path;
		this.closeChooseDialog();
		this.dispatchEvent(
			new CustomEvent("change", {
				bubbles: true,
				composed: true,
				detail: { uri: this.src },
			}),
		);
	}

	render() {
		return html`
<div>${this.renderResource()}</div>
<sl-button-group style="margin-top:1rem;">
	<sl-button variant="primary" label="Upload" @click=${this.upload}><sl-icon slot="prefix" name="upload"></sl-icon> Upload</sl-button>
	<sl-button variant="success" label="Choose" @click=${this.chooseUpload}><sl-icon slot="prefix" name="cloud-arrow-down"></sl-icon> Use existing</sl-button>
	<sl-button variant="danger" label="Remove" @click=${this.removeUpload}><sl-icon slot="prefix" name="x-lg"></sl-icon> Remove</sl-button>
</sl-button-group>
<sl-dialog label="Choose an asset" style="--width: 50vw;">
	<i6q-resource-list @resource-pick=${this.resourcePick} accept=${this.accept}></i6q-resource-list>
	<sl-button-group slot="footer">
		<sl-button variant="warning" @click=${this.closeChooseDialog}>Cancel</sl-button>
	</sl-button-group>
</sl-dialog>
<input style="display:none;" @change=${this.change} type="file" accept="${
			this.accept
		}/*" />
`;
	}
}
