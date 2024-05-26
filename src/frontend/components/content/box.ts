import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { contentTypes, EditableElement } from "../abstract";

@customElement("i6q-box")
export class Box extends EditableElement {
	static styles = css`
	sl-details {
		margin-bottom: 1rem;
	}
	h3 {
		margin: 0;
	}

	sl-details[variant="primary"]::part(header) {
		background: var(--sl-color-primary-600);
		color: var(--sl-color-neutral-0);
	}
	sl-details[variant="primary"]::part(base) {
		border-color: var(--sl-color-primary-600);
	}

	sl-details[variant="success"]::part(header) {
		background: var(--sl-color-success-600);
		color: var(--sl-color-neutral-0);
	}
	sl-details[variant="success"]::part(base) {
		border-color: var(--sl-color-success-600);
	}

	sl-details[variant="neutral"]::part(header) {
		background: var(--sl-color-neutral-600);
		color: var(--sl-color-neutral-0);
	}
	sl-details[variant="neutral"]::part(base) {
		border-color: var(--sl-color-neutral-600);
	}

	sl-details[variant="warning"]::part(header) {
		background: var(--sl-color-warning-600);
		color: var(--sl-color-neutral-0);
	}
	sl-details[variant="warning"]::part(base) {
		border-color: var(--sl-color-warning-600);
	}

	sl-details[variant="danger"]::part(header) {
		background: var(--sl-color-danger-600);
		color: var(--sl-color-neutral-0);
	}
	sl-details[variant="danger"]::part(base) {
		border-color: var(--sl-color-danger-600);
	}

	sl-radio-button[value="primary"]:hover::part(button),
	sl-radio-button[value="primary"]::part(button--checked) {
		background: var(--sl-color-primary-600);
		border-color: var(--sl-color-primary-700);
	}

	sl-radio-button[value="success"]:hover::part(button),
	sl-radio-button[value="success"]::part(button--checked) {
		background: var(--sl-color-success-600);
		border-color: var(--sl-color-success-700);
	}

	sl-radio-button[value="neutral"]:hover::part(button),
	sl-radio-button[value="neutral"]::part(button--checked) {
		background: var(--sl-color-neutral-600);
		border-color: var(--sl-color-neutral-700);
	}

	sl-radio-button[value="warning"]:hover::part(button),
	sl-radio-button[value="warning"]::part(button--checked) {
		background: var(--sl-color-warning-600);
		border-color: var(--sl-color-warning-700);
	}

	sl-radio-button[value="danger"]:hover::part(button),
	sl-radio-button[value="danger"]::part(button--checked) {
		background: var(--sl-color-danger-600);
		border-color: var(--sl-color-danger-700);
	}

`;

	@property({ type: String, reflect: true })
	variant = "primary";

	@property({ type: String, reflect: true })
	summary = "Box";

	serialize() {
		return {
			T: "Box",
			C: EditableElement.serializeNodes(this.childNodes),
			variant: this.variant,
			summary: this.summary,
		};
	}

	newElement() {
		this.append(document.createElement("i6q-stem-cell"));
	}

	editSummary(e: Event) {
		this.summary = (e.target as HTMLInputElement).value;
		this.dispatchEditEvent();
	}

	editVariant(e: Event) {
		this.variant = (e.target as HTMLInputElement).value;
		this.dispatchEditEvent();
	}

	renderEdit() {
		return html`
<i6q-edit-box typeName="Box" icon="card-list">
	<sl-input placeholder="Headline" style="display: block; margin-bottom: 1rem;" @sl-input=${this.editSummary} value=${this.summary}></sl-input>

	<sl-radio-group style="margin-bottom: 1rem;" value="${this.variant}" @sl-change=${this.editVariant}>
		<sl-radio-button pill value="primary">Primary</sl-radio-button>
		<sl-radio-button pill value="success">Success</sl-radio-button>
		<sl-radio-button pill value="neutral">Neutral</sl-radio-button>
		<sl-radio-button pill value="warning">Warning</sl-radio-button>
		<sl-radio-button pill value="danger">Danger</sl-radio-button>
	</sl-radio-group>

	<slot></slot>
	<sl-button variant="success" @click=${this.newElement}>
		<sl-icon slot="prefix" name="plus-lg"></sl-icon>
		New element
	</sl-button>
</i6q-edit-box>`;
	}

	render() {
		if (this.frameState === "edit") {
			return this.renderEdit();
		}
		return html`
<sl-details variant=${this.variant}>
	<h3 slot="summary">${this.summary}</h3>
	<slot></slot>
</sl-details>
	`;
	}

	static {
		contentTypes.add({
			cons: () => new Box(),
			name: "Box",
			icon: "card-list",
		});
	}
}
