import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { EditableElement } from "../abstract";
import { typographicStyles } from "../styles";
import { contentTypes } from "../../../common/contentTypes";

@customElement("i6q-text")
export class Text extends EditableElement {
	static styles = [typographicStyles];

	@property({ type: String })
	editValue = "";

	editInput(e: InputEvent) {
		if (e.target) {
			this.editValue = (e.target as any).value;
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
<i6q-edit-box typeName="Text" icon="justify-left">
	<sl-textarea rows=4 @sl-input=${this.editInput} value=${this.editValue}></sl-textarea>
</i6q-edit-box>`;
	}

	render() {
		if (this.edit) {
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
