import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { contentTypes, EditableElement } from "../abstract";
import { typographicStyles } from "../styles";

@customElement("i6q-text")
export class Text extends EditableElement {
	static styles = [typographicStyles];

	editValue = "";

	editInput(e: CustomEvent) {
		e.stopPropagation();
		if (e.detail && e.detail.value) {
			this.editValue = e.detail.value;
			this.innerHTML = this.editValue;
			this.dispatchEditEvent();
		}
	}

	serialize() {
		return {
			T: "Text",
			C: EditableElement.serializeNodes(this.childNodes),
		};
	}

	renderEdit() {
		return html`
<i6q-edit-box typeName="Text" icon="justify-left" class="noPadding">
	<i6q-rte @rte-edit=${this.editInput} value=${this.editValue}></i6q-rte>
</i6q-edit-box>`;
	}

	render() {
		if (this.frameState === "edit") {
			if (!this.editValue) {
				this.editValue = this.innerHTML.trim();
			}
			return this.renderEdit();
		}
		return html`<slot></slot>`;
	}

	static {
		contentTypes.add({
			cons: () => new Text(),
			name: "Text",
			icon: "justify-left",
		});
	}
}
