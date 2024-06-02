import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { EditableElement } from "../abstract";
import { generateTypeUID } from "../../../common/tuid";

@customElement("wn-multiple-choice-option")
export class MultipleChoiceOption extends EditableElement {
	@property({ type: Boolean, reflect: true })
	selected = false;

	@property({ type: Boolean })
	multiple = false;

	@property({ type: Boolean, reflect: true })
	correct = false;

	@property({ type: Boolean })
	disabled = false;

	@property({ type: String })
	editValue = "";

	@property({ type: String })
	checkHightlight: "" | "correct" | "wrong" = "";

	_onClick() {
		if (this.disabled) {
			return;
		}
		this.dispatchEvent(
			new CustomEvent("wn-option-click", {
				bubbles: true,
				composed: true,
			}),
		);
		this.selected = !this.selected;
	}

	editInput(e: InputEvent) {
		if (e.target) {
			this.editValue = (e.target as any).value;
			this.innerHTML = this.editValue;
			this.dispatchEditEvent();
		}
	}

	removeOption() {
		this.dispatchEditEvent();
		this.remove();
	}

	toggleCorrect(e: Event) {
		e.stopPropagation();
		e.preventDefault();
		this.correct = !this.correct;
	}

	newElement(e: Event) {
		e.stopPropagation();
		e.preventDefault();
		const ele = document.createElement("wn-multiple-choice-option");
		ele.innerHTML = "New Answer";
		let id = generateTypeUID("MCO");
		for (let i = 0; i < 100; i++) {
			if (!document.querySelector(`#${id}`)) {
				break;
			}
		}
		ele.id = id;
		this.before(ele);
	}

	serialize() {
		return {
			T: "Option",
			C: EditableElement.serializeNodes(this.childNodes),
			correct: this.correct,
		};
	}

	renderEdit() {
		return html`
<wn-edit-box singleLine icon="check2-circle">
	<sl-input placeholder="Answer text" style="display:inline-block; margin-right: 1rem;" @sl-input=${this.editInput} value=${this.editValue}></sl-input>
	<sl-switch ?checked=${this.correct} @sl-change=${this.toggleCorrect}>Correct</sl-switch>
</wn-edit-box>`;
	}

	render() {
		if (this.frameState === "edit") {
			if (!this.editValue) {
				this.editValue = this.innerHTML.trim();
			}
			return this.renderEdit();
		}
		const classes = [];
		if (this.selected) {
			classes.push("selected");
		}
		if (this.multiple) {
			classes.push("multiple");
		}
		if (this.disabled) {
			classes.push("disabled");
		}
		if (this.checkHightlight) {
			classes.push(this.checkHightlight);
		}
		return html`<div @click=${this._onClick} class="${classes.join(
			" ",
		)}"><slot></slot></div>`;
	}

	static styles = css`
* {
	box-sizing: border-box;
}

:host {
	margin-bottom: 12px;
	display:block;
}
:host:last-child {
	margin-bottom: 0;
}

div {
	padding: 4px 8px 4px 36px;
	border: solid 2px var(--color-primary);
	border-radius: 8px;
	background: var(--color-background-light);
	cursor: pointer;
	position: relative;
	user-select: none;
	position: relative;
	transition: background-color 200ms ease-in-out, border-color 200ms ease-in-out, border-radius 500ms;
}

div::before {
	content: '';
	display: block;
	position: absolute;
	left: 6px;
	top: 6px;
	width: 20px;
	height: 20px;
	border-radius: 50%;
	box-sizing: border-box;
	border: solid 2px var(--color-primary-light);
	background: transparent;
	transition: background-color 200ms ease-in-out, border-radius 500ms;
}

div::after {
	content: '';
	display: block;
	position: absolute;
	left: 11px;
	top: 11px;
	width: 10px;
	height: 10px;
	border-radius: 50%;
	box-sizing: border-box;
	background: transparent;
	transition: background-color 200ms ease-in-out;
}

div:focus,
div:hover {
	background: var(--color-background);
}

div.multiple::before {
	border-radius: 2px;
}


div.selected::after {
	background-color: var(--color-primary);
}

div.wrong {
	border-color: var(--color-wrong);
}

div.wrong {
	background: repeating-linear-gradient(
		45deg,
		color-mix(in srgb, var(--color-wrong), transparent 50%),
		color-mix(in srgb, var(--color-wrong), transparent 50%) 12px,
		color-mix(in srgb, var(--color-wrong), transparent 70%) 12px,
		color-mix(in srgb, var(--color-wrong), transparent 70%) 24px
	);
	background-size: 200% 200%;
	animation: barberpole 30s linear infinite;
}

@keyframes barberpole {
	100% {
		background-position: 100% 100%;
	}
}

div.correct {
	border-color:var(--color-correct);
	background: repeating-linear-gradient(
		45deg,
		color-mix(in srgb, var(--color-correct), transparent 50%),
		color-mix(in srgb, var(--color-correct), transparent 50%) 12px,
		color-mix(in srgb, var(--color-correct), transparent 70%) 12px,
		color-mix(in srgb, var(--color-correct), transparent 70%) 24px
	);
	background-size: 200% 200%;
	animation: barberpole 30s linear infinite;
}

div.disabled {
	background-color: var(--color-background-dark) !important;
	cursor: not-allowed;
}
`;
}
