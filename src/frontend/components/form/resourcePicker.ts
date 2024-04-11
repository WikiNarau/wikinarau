import { html, css, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { uploadResource } from "../../rpc";

@customElement("i6q-resource-picker")
export class ResourcePicker extends LitElement {
	static styles = css`
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
`;

	@query("input")
	input?: HTMLInputElement;

	@property({ type: String })
	accept: string = "";

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

	render() {
		return html`<input @change=${this.change} type="file" accept=${this.accept} />`;
	}
}
