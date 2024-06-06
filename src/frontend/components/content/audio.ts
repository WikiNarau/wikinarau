import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { contentTypes, EditableElement } from "../abstract";

@customElement("wn-audio")
export class Audio extends EditableElement {
	@property({ type: String, reflect: true })
	src = "";

	resourceChange(e: CustomEvent) {
		e.preventDefault();
		e.stopPropagation();
		const uri = e.detail.uri;
		this.src = uri;
		this.dispatchEditEvent();
	}

	renderEdit() {
		return html`
	<wn-edit-box typeName="Audio" icon="volume-up" dropStatus=${this.dropStatus}>
		<wn-resource-picker src=${this.src} @change=${this.resourceChange} accept="audio"></wn-resource-picker>
	</wn-edit-box>`;
	}

	serialize() {
		return {
			T: "Audio",
			src: this.src,
		};
	}

	render() {
		if (this.frameState === "edit") {
			return this.renderEdit();
		}
		return this.src ? html`<audio src="${this.src}" controls></audio>` : html``;
	}

	static {
		contentTypes.add({
			cons: () => new Audio(),
			name: "Audio",
			icon: "volume-up",
		});
	}

	static styles = css`
audio {
	display: block;
	width: 100%;
	height: 3rem;
	margin-bottom: 1rem;
}
`;
}
