import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { typographicStyles } from "../styles";

@customElement("i6q-edit-box")
export class EditBox extends LitElement {
	@property({ type: Boolean })
	singleLine = false;

	@property({ type: String })
	variant = '';

	static styles = [
		typographicStyles,
		css`

.edit-box {
	display: block;
	border: solid var(--sl-input-border-width) var(--sl-input-border-color);
	border-radius: var(--sl-input-border-radius-medium);
	margin-bottom: 1rem;
}

.left {
	float: left;
}

.right {
	float: right;
}

.bar {
	display: table;
	width:100%;
	padding: 2px 12px;
	box-sizing: border-box;
	cursor: move; /* fallback if grab cursor is unsupported */
	cursor: grab;
	cursor: -moz-grab;
	cursor: -webkit-grab;
	background: var(--sl-input-border-color);
	border-bottom: solid var(--sl-input-border-width) var(--sl-input-border-color);
	transition: background-color 300ms;
}

.edit-box {
	transition: border-color 300ms;
}

:host([variant="sky"]) .edit-box {
	border-color: var(--sl-color-sky-700);
}
:host([variant="sky"]) .bar {
	background: var(--sl-color-sky-600);
	border-color: var(--sl-color-sky-700);
	color: #fff;
}

:host([variant="emerald"]) .edit-box {
	border-color: var(--sl-color-emerald-700);
}
:host([variant="emerald"]) .bar {
	background: var(--sl-color-emerald-600);
	border-color: var(--sl-color-emerald-700);
	color: #fff;
}

:host([variant="gray"]) .edit-box {
	border-color: var(--sl-color-gray-700);
}
:host([variant="gray"]) .bar {
	background: var(--sl-color-gray-600);
	border-color: var(--sl-color-gray-700);
	color: #fff;
}

:host([variant="amber"]) .edit-box {
	border-color: var(--sl-color-amber-700);
}
:host([variant="amber"]) .bar {
	background: var(--sl-color-amber-600);
	border-color: var(--sl-color-amber-700);
	color: #fff;
}

:host([variant="red"]) .edit-box {
	border-color: var(--sl-color-red-700);
}
:host([variant="red"]) .bar {
	background: var(--sl-color-red-600);
	border-color: var(--sl-color-red-700);
	color: #fff;
}

:host([variant="pink"]) .edit-box {
	border-color: var(--sl-color-pink-700);
}
:host([variant="pink"]) .bar {
	background: var(--sl-color-pink-600);
	border-color: var(--sl-color-pink-700);
	color: #fff;
}

.singleLine .bar {
	background: transparent;
	border: none;
}

.content {
	padding: 6px 12px;
}

h5 {
	margin-bottom: 0;
	color: inherit;
	vertical-align: middle;
	line-height: 1.6em;
}

sl-icon-button {
	color: inherit;
}

:host(.noPadding) .content {
	padding:0;
}
`,
	];

	@property({ type: String })
	typeName = "";

	@property({ type: String })
	icon = "";

	removeHandler() {
		this.dispatchEvent(
			new CustomEvent("remove", {
				bubbles: true,
				composed: true,
			}),
		);
	}

	moveUp() {
		this.dispatchEvent(
			new CustomEvent("moveUp", {
				bubbles: true,
				composed: true,
			}),
		);
	}

	moveDown() {
		this.dispatchEvent(
			new CustomEvent("moveDown", {
				bubbles: true,
				composed: true,
			}),
		);
	}

	newElement() {
		this.dispatchEvent(
			new CustomEvent("newElement", {
				bubbles: true,
				composed: true,
			}),
		);
	}

	render() {
		return html`
<div class="edit-box
	${this.singleLine ? "singleLine" : ""}"
>
	<div class="bar" draggable="true">
		<div class="left">
			<sl-icon style="display:inline-block; vertical-align:middle; margin-right:0.25rem;" name="${
				this.icon
			}" slot="prefix"></sl-icon>
			${
				this.singleLine
					? html`<slot></slot>`
					: html`<h5 style="display:inline-block;">${this.typeName}</h5>`
			}
		</div>
		<div class="right">
			<sl-tooltip content="New element">
				<sl-icon-button name="plus-lg" label="New element" @click=${
					this.newElement
				}></sl-icon-button>
			</sl-tooltip>
			<sl-tooltip content="Remove element">
				<sl-icon-button name="x-lg" label="Remove element" @click=${
					this.removeHandler
				}></sl-icon-button>
			</sl-tooltip>
		</div>
	</div>
	${
		this.singleLine
			? html``
			: html`
		<div class="content">
			<slot></slot>
		</div>`
	}
</div>`;
	}
}
