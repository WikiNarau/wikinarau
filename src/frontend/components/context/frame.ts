import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { WSElementSync } from "../../sync";
import { EditableElement } from "../abstract";
import { SerializedElement } from "../../../common/contentTypes";

@customElement("i6q-frame")
export class Frame extends LitElement {
	sync?: WSElementSync;

	render() {
		return html`
<slot></slot>
`;
	}

	serialize(): SerializedElement[] {
		return EditableElement.serializeNodes(this.childNodes);
	}

	firstUpdated() {
		//this.sync = new WSElementSync(this);
	}

	static styles = css`
:host {
  display: block;
  box-sizing: border-box;
  overflow: hidden;
}

footer {
  display: block;
  height: 1.6rem;
  background: var(--color-primary-dark);
  box-sizing: border-box;
  border-top: solid 1px var(--color-primary);
}
`;
}

declare global {
	interface HTMLElementTagNameMap {
		"i6q-frame": Frame;
	}
}
