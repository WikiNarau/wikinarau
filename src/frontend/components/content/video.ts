import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { contentTypes, EditableElement } from "../abstract";

@customElement("i6q-video")
export class Video extends EditableElement {
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
	<i6q-edit-box typeName="Video" icon="play-btn">
		<i6q-resource-picker src=${this.src} @change=${this.resourceChange} accept="video"></i6q-resource-picker>
	</i6q-edit-box>`;
	}

	serialize() {
		return {
			T: "Video",
			src: this.src,
		};
	}

	render() {
		if (this.frameState === "edit") {
			return this.renderEdit();
		}
		return this.src ? html`<video src="${this.src}" controls></video>` : html``;
	}

	static {
		contentTypes.add({
			cons: () => new Video(),
			name: "Video",
			icon: "play-btn",
		});
	}

	static styles = css`
video {
	display: block;
	width: 100%;
	height: auto;
	margin-bottom: 1rem;
	aspect-ratio: 16/9;
}
`;
}
