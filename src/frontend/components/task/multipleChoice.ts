import { HTMLTemplateResult, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { MultipleChoiceOption } from "./multipleChoiceOption";
import { contentTypes, EditableElement } from "../abstract";
import { generateTypeUID } from "../../../common/tuid";

@customElement("wn-multiple-choice")
export class MultipleChoice extends EditableElement {
	@property({ type: Boolean, reflect: true })
	multiple = false;

	@property({ type: String, reflect: true })
	protected state: "" | "check" | "show" | "correct" = "";

	options: Array<MultipleChoiceOption> = [];

	@state()
	protected result?: HTMLTemplateResult;

	private check() {
		let score = 0;
		let maxScore = 0;
		for (const option of this.options) {
			option.disabled = true;
			if (option.correct) {
				maxScore++;
				if (option.selected) {
					option.checkHightlight = "correct";
					score++;
				} else {
					option.checkHightlight = "";
				}
			} else {
				if (option.selected) {
					option.checkHightlight = "wrong";
				} else {
					option.checkHightlight = "";
				}
			}
		}
		if (!this.multiple) {
			maxScore = Math.min(1, maxScore);
		}
		this.setResult(score, maxScore);
		this.state = score === maxScore ? "correct" : "check";
	}

	private show() {
		for (const option of this.options) {
			option.disabled = true;
			if (option.correct) {
				option.checkHightlight = "correct";
			}
		}
	}

	private onCheck() {
		this.result = undefined;
		this.state = "check";
	}

	private onShow() {
		this.state = "show";
	}

	private onRetry() {
		this.state = "";
		this.result = undefined;
		for (const option of this.options) {
			option.disabled = false;
			option.selected = false;
			option.checkHightlight = "";
		}
	}

	private setResult(score: number, maxScore: number) {
		const text = score === maxScore ? "Correct!" : "Wrong";
		this.result = html`${text}<br/><br/><wn-success-bar score="${score}" maxScore="${maxScore}"></wn-success-bar>`;
	}

	private optionClick() {
		if (this.multiple) {
			return;
		}
		for (const option of this.options) {
			option.selected = false;
			option.checkHightlight = "";
		}
	}

	connectedCallback() {
		super.connectedCallback();
		this.addEventListener("wn-option-click", this.optionClick.bind(this));
		this.options = Array.from(
			this.querySelectorAll(":scope > wn-multiple-choice-option"),
		);
	}

	updated() {
		if (!this.state && this.result) {
			this.result = undefined;
			for (const option of this.options) {
				if (option.disabled) {
					option.disabled = false;
				}
				if (option.checkHightlight) {
					option.checkHightlight = "";
				}
			}
		}
		for (const o of this.options) {
			if (o.multiple !== this.multiple) {
				o.multiple = this.multiple;
			}
		}
		if (this.state === "show") {
			this.show();
		}
	}

	newAnswer() {
		const ele = document.createElement("wn-multiple-choice-option");
		ele.innerHTML = "New Answer";
		let id = generateTypeUID("MCO");
		for (let i = 0; i < 100; i++) {
			if (!document.querySelector(`#${id}`)) {
				break;
			}
		}
		ele.id = id;
		this.append(ele);
		this.dispatchEditEvent();
	}

	toggleMultiple(e: Event) {
		e.stopPropagation();
		e.preventDefault();
		this.multiple = !this.multiple;
		this.dispatchEditEvent();
	}

	renderEdit() {
		return html`
		<wn-edit-box typeName="Multiple Choice" icon="list-check" dropStatus=${this.dropStatus}>
		<div class="wrap">
			<sl-switch ?checked=${this.multiple} @sl-change=${this.toggleMultiple}>Allow multiple answers</sl-switch>
			<br/><br/>
			<slot></slot>
			<sl-button variant="success" size="small" @click=${this.newAnswer}>
				<sl-icon slot="prefix" name="plus-lg"></sl-icon>
				New answer
			</sl-button>
		</div>
		</wn-edit-box>
		`;
	}

	render() {
		if (this.frameState === "edit") {
			this.maybeUnshuffleChildren();
			return this.renderEdit();
		}
		this.maybeShuffleChildren();
		if (this.state === "check" || (this.state === "correct" && !this.result)) {
			this.check();
		}
		const checkButton = html`
<sl-button variant="primary" @click=${this.onCheck}>
	<sl-icon slot="prefix" name="check-lg"></sl-icon>
	Check
</sl-button>`;
		const showButton = html`
	<sl-button variant="primary" @click=${this.onShow}>
		<sl-icon slot="prefix" name="eye"></sl-icon>
		Show answer
	</sl-button>`;
		const retryButton = html`
	<sl-button variant="primary" @click=${this.onRetry}>
		<sl-icon slot="prefix" name="arrow-counterclockwise"></sl-icon>
		Retry
	</sl-button>`;
		return html`
<div class="wrap">
	<slot></slot>
	<div class="result">
		${this.result}
	</div>
	${this.state === "" ? checkButton : ""}
	${this.state === "check" ? showButton : ""}
	${this.state !== "" ? retryButton : ""}
</div>`;
	}

	serialize() {
		return {
			T: "MultipleChoice",
			C: EditableElement.serializeNodes(this.childNodes),
			multiple: this.multiple,
		};
	}

	static {
		contentTypes.add({
			cons: () => new MultipleChoice(),
			name: "Multiple Choice",
			icon: "list-check",
		});
	}

	static styles = css`
.result,
::slotted(div) {
	margin-bottom: 1rem;
	display: block;
}

::slotted(div.header) {
	padding: 0;
}

::slotted(wn-multiple-choice-option) {
	margin-bottom: 1rem;
	box-sizing: border-box;
	display: block;
}

h5 {
	font-size: 1.3rem;
	margin: 0 0 0.5rem;
}

:host {
	display: block;
	margin-bottom: 1rem;
}

`;
}
