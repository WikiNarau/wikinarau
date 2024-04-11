import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("i6q-edit-bar")
export class EditBar extends LitElement {
	@property({ type: String })
	url = "";

	titleChange(e: InputEvent) {
		const h = document.querySelector<HTMLElement>("main h1");
		if (h) {
			h.innerText = (e.target as HTMLInputElement).value;
		}
	}

	cancel() {
		window.location.assign(window.location.pathname);
	}

	save() {
		this.dispatchEvent(
			new CustomEvent("save", {
				bubbles: true,
				composed: true,
			}),
		);
	}

	render() {
		const title =
			document.querySelector<HTMLElement>("main h1")?.innerText || "";
		return html`
		<div class="edit-bar">
			<div class="left">
				<sl-input placeholder="Title" @sl-input=${this.titleChange} value=${title}></sl-input>
			</div>
			<div class="right">
				<sl-button-group>
					<sl-button variant="warning" @click=${this.cancel}>
						<sl-icon slot="prefix" name="x-lg"></sl-icon>
						Cancel
					</sl-button>
					<sl-button variant="success" @click=${this.save}>
						<sl-icon slot="prefix" name="floppy"></sl-icon>
						Save
					</sl-button>
				</sl-button-group>
			</div>
		</div>
		<slot></slot>`;
	}

	static styles = css`
		.left {
			float:left;
			width: calc(100% - 20rem);
		}

		.right {
			float: right;
		}

		.edit-bar {
			display: table;
			width:100%;
			margin-bottom: 1rem;
			position: sticky;
			top: 3rem;
			padding-top: 0.5rem;
			padding-bottom: 0.5rem;
			background: var(--color-background-light);
			border-bottom: solid 2px var(--sl-color-neutral-600);
			z-index:100;
		}
	`;
}
