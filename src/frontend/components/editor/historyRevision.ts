import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { Revision } from "../../../common/types";
import { updateContentRevision } from "../../rpc";
import { typographicStyles } from "../styles";

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
		`,
	];
	@property({ attribute: false })
	revision?: Revision;

	@state()
	state: "" | "preview" | "viewCode" = "";

	preview() {
		this.state = "preview";
	}

	viewCode() {
		this.state = "viewCode";
	}

	reset() {
		this.state = "";
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
			return html`<div>Error</div>`;
		}
		const createdAt = new Date(this.revision.createdAt * 1000);
		const iframeUri =
			this.revision.uri +
			"?embed=true&revision=" +
			encodeURIComponent(this.revision.id);
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
				<sl-icon-button @click=${this.preview} style="font-size:1.4rem;" name="eye" label="Preview"></sl-icon-button>
				<sl-icon-button @click=${this.viewCode} style="font-size:1.4rem;" name="code" label="View code"></sl-icon-button>
				<sl-icon-button @click=${this.revert} style="font-size:1.4rem;" name="arrow-counterclockwise" label="Revert to this version"></sl-icon-button>
			</div>
			<sl-dialog @sl-hide=${this.reset} ?open=${
				this.state === "viewCode"
			} label="Code for ${this.revision.id}" style="--width: 50vw;">
				<sl-textarea readonly rows=24 value=${this.revision.content}></sl-textarea>
			</sl-dialog>
			<sl-dialog @sl-hide=${this.reset} ?open=${
				this.state === "preview"
			} label="Preview of Version ${
				this.revision.id
			} from ${createdAt.toLocaleString()}" style="--width: 50vw;">
				<iframe loading="lazy" style="display: block; width: 100%; min-height: 80vh; box-sizing: border-box;" src="${iframeUri}"></iframe>
			</sl-dialog>
		</div>
		`;
	}
}
