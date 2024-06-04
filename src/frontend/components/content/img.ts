import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { contentTypes, EditableElement } from "../abstract";

@customElement("wn-img")
export class Img extends EditableElement {
	@property({ type: String, reflect: true })
	src = "";

	@property({ type: Number })
	width = 0;

	@property({ type: Number })
	height = 0;

	resourceChange(e: CustomEvent) {
		e.preventDefault();
		e.stopPropagation();
		const uri = e.detail.uri;
		this.src = uri;
		this.dispatchEditEvent();
	}

	renderEdit() {
		return html`
	<wn-edit-box typeName="Image" icon="image">
		<wn-resource-picker src=${this.src} @change=${this.resourceChange} accept="image"></wn-resource-picker>
	</wn-edit-box>`;
	}

	serialize() {
		return {
			T: "Img",
			src: this.src,
			width: this.width,
			height: this.height,
		};
	}

	render() {
		if (this.frameState === "edit") {
			return this.renderEdit();
		}
		return html`<img loading="lazy" src="${this.src}" width="${this.width}" height="${this.height}" />`;
	}

	static {
		contentTypes.add({
			cons: () => new Img(),
			name: "Image",
			icon: "image",
		});
	}

	static styles = css`
img {
	display: block;
	width: 100%;
	height: auto;
	margin-bottom: 1rem;
}
`;
}
