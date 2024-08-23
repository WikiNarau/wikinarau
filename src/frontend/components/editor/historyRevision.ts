import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { Revision } from "../../../common/types";
import { updateContentRevision } from "../../rpc";
import { typographicStyles } from "../styles";
import { showDialog } from "../dialog/dialog";

@customElement("wn-history-revision")
export class HistoryRevision extends LitElement {
	static styles = [
		typographicStyles,
		css`
		:host(:nth-child(even)) .wrap {
			background:#e8e8e8;
		}
		.wrap {
			display:table;
			width: 100%;
			border-bottom: solid 1px var(--sl-color-primary-600);
		}
		iframe {
			border: none;
		}
		sl-icon-button {
			font-size: 1.4rem;
		}

		`,
	];
	@property({ attribute: false })
	revision?: Revision;

	preview() {
		if (this.revision) {
			const createdAt = new Date(this.revision.createdAt * 1000);
			const iframeUri =
				this.revision.uri +
				"?embed=true&revision=" +
				encodeURIComponent(this.revision.id);
			showDialog(
				`Preview of Version ${this.revision.id} from ${createdAt.toLocaleString()}`,
				`<iframe loading="lazy" style="display: block; width: 100%; min-height: 80vh; box-sizing: border-box;" src="${iframeUri}"></iframe>`,
			);
		}
	}

	viewCode() {
		if (this.revision) {
			const dialog = showDialog(
				`Code for ${this.revision.id}`,
				`<sl-textarea readonly rows=24></sl-textarea>`,
			);
			const textarea = dialog.querySelector("sl-textarea");
			if (textarea) {
				textarea.value = this.revision.content;
			}
		}
	}

	async revert() {
		if (!this.revision) {
			return;
		}
		const commitMessage = `Revert to ${this.revision.id}`;
		await updateContentRevision(
			this.revision.uri,
			this.revision.content,
			commitMessage,
		);
		window.location.assign(window.location.pathname);
	}

	render() {
		if (!this.revision) {
			return html`<h1>Error</h1>`;
		}
		return html`
		<div class="wrap">
			<div style="display: inline-block; padding: 0.35rem 0 0;">
				<sl-badge><wn-datetime timestamp=${this.revision.createdAt}></wn-datetime></sl-badge>
				<sl-badge variant="neutral">ID: ${this.revision.id}</sl-badge>
			</div>
			${
				this.revision.commitMessage
					? html`<sl-badge variant="warning">${this.revision.commitMessage}</sl-badge>`
					: null
			}
			<div style="float: right;">
				<sl-icon-button @click=${this.preview} name="eye" label="Preview"></sl-icon-button>
				<sl-icon-button @click=${this.viewCode} name="code" label="View code"></sl-icon-button>
				<sl-icon-button @click=${this.revert} name="arrow-counterclockwise" label="Revert to this version"></sl-icon-button>
			</div>
		</div>
		`;
	}
}
