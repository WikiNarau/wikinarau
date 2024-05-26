import { css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { contentTypes, EditableElement } from "../abstract";

@customElement("i6q-stem-cell")
export class StemCell extends EditableElement {
	renderEdit() {
		const T = Array.from(contentTypes.values()).map(
			(T) => html`
<sl-button variant="primary" @click=${() => this.replaceWith(T.cons())}>
	<sl-icon name="${T.icon}" slot="prefix"></sl-icon>${T.name}
</sl-button>`,
		);
		return html`
<i6q-edit-box typeName="Choose a Type" icon="box">
	<sl-button-group>
		${T}
	</sl-button-group>
</i6q-edit-box>`;
	}

	render() {
		if (this.frameState === "edit") {
			return this.renderEdit();
		}
		return html``;
	}

	serialize() {
		return {
			T: "StemCell",
		};
	}

	static styles = css`
	i6q-edit-box > * {
		margin-right: 0.5rem;
		margin-bottom: 0.5rem;
	}
`;
}
