import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { EditableElement } from "../abstract";
import { contentTypes } from "../../../common/contentTypes";

@customElement("i6q-img")
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
	<i6q-edit-box typeName="Image" icon="image">
		<img src="${this.src}" width="${this.width}" height="${this.height}" />
		<i6q-resource-picker @change=${this.resourceChange} accept="image/*"></i6q-file-uploader>
	</i6q-edit-box>`;
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
		return html`<img src="${this.src}" width="${this.width}" height="${this.height}" />`;
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
