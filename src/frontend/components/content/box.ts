import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { contentTypes, EditableElement } from "../abstract";

@customElement("wn-box")
export class Box extends EditableElement {
	static styles = css`
	sl-details {
		margin-bottom: 1rem;
	}
	h3 {
		margin: 0;
	}

	sl-details[variant="sky"]::part(header) {
		background: var(--sl-color-sky-600);
		color: var(--sl-color-neutral-0);
	}
	sl-details[variant="sky"]::part(base) {
		border-color: var(--sl-color-sky-600);
	}

	sl-details[variant="emerald"]::part(header) {
		background: var(--sl-color-emerald-600);
		color: var(--sl-color-neutral-0);
	}
	sl-details[variant="emerald"]::part(base) {
		border-color: var(--sl-color-emerald-600);
	}

	sl-details[variant="gray"]::part(header) {
		background: var(--sl-color-gray-600);
		color: var(--sl-color-neutral-0);
	}
	sl-details[variant="gray"]::part(base) {
		border-color: var(--sl-color-gray-600);
	}

	sl-details[variant="red"]::part(header) {
		background: var(--sl-color-red-600);
		color: var(--sl-color-neutral-0);
	}
	sl-details[variant="red"]::part(base) {
		border-color: var(--sl-color-red-600);
	}

	sl-details[variant="amber"]::part(header) {
		background: var(--sl-color-amber-600);
		color: var(--sl-color-neutral-0);
	}
	sl-details[variant="amber"]::part(base) {
		border-color: var(--sl-color-amber-600);
	}

	sl-details[variant="pink"]::part(header) {
		background: var(--sl-color-pink-600);
		color: var(--sl-color-neutral-0);
	}
	sl-details[variant="pink"]::part(base) {
		border-color: var(--sl-color-pink-600);
	}

	sl-radio-button[value="sky"]:hover::part(button),
	sl-radio-button[value="sky"]::part(button--checked) {
		background: var(--sl-color-sky-600);
		border-color: var(--sl-color-sky-700);
	}

	sl-radio-button[value="emerald"]:hover::part(button),
	sl-radio-button[value="emerald"]::part(button--checked) {
		background: var(--sl-color-emerald-600);
		border-color: var(--sl-color-emerald-700);
	}

	sl-radio-button[value="gray"]:hover::part(button),
	sl-radio-button[value="gray"]::part(button--checked) {
		background: var(--sl-color-gray-600);
		border-color: var(--sl-color-gray-700);
	}

	sl-radio-button[value="amber"]:hover::part(button),
	sl-radio-button[value="amber"]::part(button--checked) {
		background: var(--sl-color-amber-600);
		border-color: var(--sl-color-amber-700);
	}

	sl-radio-button[value="red"]:hover::part(button),
	sl-radio-button[value="red"]::part(button--checked) {
		background: var(--sl-color-red-600);
		border-color: var(--sl-color-red-700);
	}

	sl-radio-button[value="pink"]:hover::part(button),
	sl-radio-button[value="pink"]::part(button--checked) {
		background: var(--sl-color-pink-600);
		border-color: var(--sl-color-pink-700);
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
		this.append(document.createElement("wn-stem-cell"));
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
<wn-edit-box typeName="Box" icon="card-list" variant=${this.variant}>
	<sl-input placeholder="Headline" style="display: block; margin-bottom: 1rem;" @sl-input=${this.editSummary} value=${this.summary}></sl-input>

	<sl-radio-group style="margin-bottom: 1rem;" value="${this.variant}" @sl-change=${this.editVariant}>
		<sl-radio-button pill value="sky">Blue</sl-radio-button>
		<sl-radio-button pill value="emerald">Green</sl-radio-button>
		<sl-radio-button pill value="gray">Gray</sl-radio-button>
		<sl-radio-button pill value="red">Red</sl-radio-button>
		<sl-radio-button pill value="amber">Yellow</sl-radio-button>
		<sl-radio-button pill value="pink">Pink</sl-radio-button>
	</sl-radio-group>

	<slot></slot>
	<sl-button variant="success" @click=${this.newElement}>
		<sl-icon slot="prefix" name="plus-lg"></sl-icon>
		New element
	</sl-button>
</wn-edit-box>`;
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
