import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { EditableElement } from "../abstract";
import { typographicStyles } from "../styles/typographic";
import { contentTypes } from "../../../common/contentTypes";

@customElement("i6q-header")
export class Header extends EditableElement {
	static styles = [typographicStyles];

	@property({ type: String, reflect: true })
	h = "h3";

	@property({ type: String })
	editValue = "";

	static tagName(): string {
		return "i6q-header";
	}

	editInput(e: InputEvent) {
		if (e.target) {
			this.editValue = (e.target as any).value;
			this.innerHTML = this.editValue;
			this.dispatchEditEvent();
		}
	}

	editSelect(e: InputEvent) {
		if (e.target) {
			const select = e.target as HTMLInputElement;
			console.log(select.value);
			this.h = select.value;
			this.dispatchEditEvent();
		}
	}

	renderEdit() {
		return html`
		<i6q-edit-box typeName="Header" icon="paragraph">
			<sl-radio-group style="margin-bottom: 1rem;" label="Style" value="${this.h}" @sl-change=${this.editSelect}>
				<sl-radio-button pill value="h1">Heading 1</sl-radio-button>
				<sl-radio-button pill value="h2">Heading 2</sl-radio-button>
				<sl-radio-button pill value="h3">Heading 3</sl-radio-button>
				<sl-radio-button pill value="h4">Heading 4</sl-radio-button>
				<sl-radio-button pill value="h5">Heading 5</sl-radio-button>
				<sl-radio-button pill value="h6">Heading 6</sl-radio-button>
			</sl-radio-group>
			<sl-input label="Headline" style="display: block; margin-top:1rem;" @sl-input=${this.editInput} value=${this.editValue}></sl-input>
		</i6q-edit-box>`;
	}

	serialize() {
		return {
			T: "Header",
			C: EditableElement.serializeNodes(this.childNodes),
			h: this.h,
		};
	}

	render() {
		if (this.frameState === "edit") {
			if (!this.editValue) {
				this.editValue = this.innerHTML.trim();
			}
			return this.renderEdit();
		}
		switch (this.h) {
			case "h1":
				return html`<h1><slot></slot></h1>`;
			case "h2":
				return html`<h2><slot></slot></h2>`;
			case "h3":
			default:
				return html`<h3><slot></slot></h3>`;
			case "h4":
				return html`<h4><slot></slot></h4>`;
			case "h5":
				return html`<h5><slot></slot></h5>`;
			case "h6":
				return html`<h6><slot></slot></h6>`;
		}
	}

	static {
		contentTypes.add({
			cons: () => new Header(),
			name: "Header",
			icon: "paragraph",
		});
	}
}
