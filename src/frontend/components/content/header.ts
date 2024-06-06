import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { contentTypes, EditableElement } from "../abstract";
import { typographicStyles } from "../styles/typographic";

@customElement("wn-header")
export class Header extends EditableElement {
	static styles = [typographicStyles];

	@property({ type: String, reflect: true })
	h = "h3";

	@property({ type: String })
	editValue = "";

	static tagName(): string {
		return "wn-header";
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
			this.h = select.value;
			this.dispatchEditEvent();
		}
	}

	renderEdit() {
		return html`
		<wn-edit-box typeName="Header" icon="paragraph" dropStatus=${this.dropStatus}>
			<sl-radio-group style="margin-bottom: 1rem;" value="${this.h}" @sl-change=${this.editSelect}>
				<sl-radio-button pill value="h1"><span style="font-size:1.2em;">Heading 1</span></sl-radio-button>
				<sl-radio-button pill value="h2"><span style="font-size:1.1em;">Heading 2</span></sl-radio-button>
				<sl-radio-button pill value="h3"><span style="font-size:1em;">Heading 3</span></sl-radio-button>
				<sl-radio-button pill value="h4"><span style="font-size:0.9em;">Heading 4</span></sl-radio-button>
				<sl-radio-button pill value="h5"><span style="font-size:0.8em;">Heading 5</span></sl-radio-button>
				<sl-radio-button pill value="h6"><span style="font-size:0.7em;">Heading 6</span></sl-radio-button>
			</sl-radio-group>
			<sl-input placeholder="Headline" style="display: block; margin-top:1rem;" @sl-input=${this.editInput} value=${this.editValue}></sl-input>
		</wn-edit-box>`;
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
