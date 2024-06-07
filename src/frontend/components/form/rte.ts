import { html, css, LitElement, PropertyValueMap } from "lit";
import { customElement, query } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { typographicStyles } from "../styles";
import { showWarning } from "../dialog/warning";

@customElement("wn-rte")
export class RichTextEditor extends LitElement {
	static styles = [
		typographicStyles,
		css`
.wrap {
	border-radius: 0 0 var(--sl-input-border-radius-medium) var(--sl-input-border-radius-medium);
	background-color: var(--sl-input-background-color);
	transition: border-color 300ms, box-shadow 300ms;
	color: var(--sl-input-color);
}

.wrap:hover {
	border-color: var(--sl-input-border-color-hover);
}

.topBar {
	display: block;
	position: relative;
	width: 100%;
	height: 2rem;
	background: var(--sl-input-border-color);
}

.editor {
	flex: 1 1 auto;
	border: none;
	background: none;
	box-shadow: none;
	cursor: inherit;
	padding: 0.5em var(--sl-input-spacing-medium);
	font-size: var(--sl-input-font-size-medium);
	outline: none;
}
`,
	];

	@query(".editor")
	editorWrap?: HTMLElement;

	value = "";

	private curHref = "";

	change(e: Event) {
		e.stopPropagation();
		if (this.editorWrap) {
			this.value = this.editorWrap.innerHTML;
			this.dispatchEvent(
				new CustomEvent("rte-edit", {
					bubbles: true,
					composed: true,
					detail: { value: this.value },
				}),
			);
		}
	}

	connectedCallback() {
		super.connectedCallback();
	}

	firstUpdated(props: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
		super.firstUpdated(props);
	}

	bold(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		document.execCommand("bold");
	}

	italic(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		document.execCommand("italic");
	}

	underline(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		document.execCommand("underline");
	}

	superscript(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		document.execCommand("superscript");
	}

	subscript(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		document.execCommand("subscript");
	}

	strikethrough(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		document.execCommand("strikeThrough");
	}

	link(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		if (this.curHref) {
			document.execCommand("createLink", false, this.curHref);
		} else {
			this.showLinkWarning();
		}
	}

	private showLinkWarning() {
		showWarning(
			"Invalid URL",
			"Please enter a valid URL in the menu bar before trying to add links.",
		);
	}

	unlink(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		document.execCommand("unlink");
	}

	editCurHref(e: InputEvent) {
		if (e.target) {
			this.curHref = (e.target as HTMLInputElement).value;
		}
	}

	render() {
		this.value = this.getAttribute("value") || "";
		return html`
		<div class="wrap">
			<div class="topBar">
				<sl-tooltip content="Bold">
					<sl-icon-button name="type-bold" label="Bold" @click=${this.bold}></sl-icon-button>
				</sl-tooltip>
				<sl-tooltip content="Italic">
					<sl-icon-button name="type-italic" label="Italic" @click=${
						this.italic
					}></sl-icon-button>
				</sl-tooltip>
				<sl-tooltip content="Underline">
					<sl-icon-button name="type-underline" label="Underline" @click=${
						this.underline
					}></sl-icon-button>
				</sl-tooltip>
				<sl-tooltip content="StrikeThrough">
					<sl-icon-button name="type-strikethrough" label="Strikethrough" @click=${
						this.strikethrough
					}></sl-icon-button>
				</sl-tooltip>
				<sl-tooltip content="Superscript">
					<sl-icon-button name="superscript" label="Superscript" @click=${
						this.superscript
					}></sl-icon-button>
				</sl-tooltip>
				<sl-tooltip content="Subscript">
					<sl-icon-button name="subscript" label="Subscript" @click=${
						this.subscript
					}></sl-icon-button>
				</sl-tooltip>

				<sl-input size="small" style="display:inline-block; width: 16rem; margin-left: 1.5rem; position: relative; top:-0.3rem;" placeholder="Link URL" @sl-input=${
					this.editCurHref
				} value=${this.curHref}></sl-input>
				<sl-tooltip content="Add Link">
					<sl-icon-button name="link-45deg" label="Link" @click=${this.link}></sl-icon-button>
				</sl-tooltip>
				<sl-tooltip content="Remove Link">
					<sl-icon-button name="x-lg" label="Unlink" @click=${this.unlink}></sl-icon-button>
				</sl-tooltip>
			</div>
			<div @input=${this.change} class="editor" contenteditable>${unsafeHTML(
				this.value,
			)}</div>
		</div>
		`;
	}
}
