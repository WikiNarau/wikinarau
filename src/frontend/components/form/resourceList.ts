import { html, css, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { typographicStyles } from "../styles";
import { listResources } from "../../rpc";
import { ServerResource } from "../../../common/types";

@customElement("i6q-resource-list")
export class ResourceList extends LitElement {
	static styles = [typographicStyles,css`
	.list {
		text-align: center;
	}

	.resource {
		display: inline-block;
		width: 8rem;
		height: 8rem;
		margin: 0.5rem;
		cursor: pointer;
		border: solid var(--sl-input-border-width) var(--sl-input-border-color);
		border-radius: var(--sl-input-border-radius-medium);
		background-color: var(--sl-input-background-color);
		color: var(--sl-input-color);
		transition: border-color 300ms;
	}

	.resource:hover {
		border-color: var(--sl-input-border-color-focus);
	}

	.resource img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
`];

	@property({ type: String })
	accept: string = "";

	@state()
	private resources?: ServerResource[] = [];

	async refresh() {
		this.resources = undefined;
		const l = await listResources();
		this.resources = l;
	}

	chooseResource(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		const res = e.composedPath().find(ele => (ele as HTMLElement).tagName === "DIV" && (ele as HTMLElement).classList.contains("resource"));
		console.log(res);
		if(res){
			const path = (res as HTMLElement).getAttribute("path") || '';
			if(path){
				const detail = {
					path
				};
				this.dispatchEvent(new CustomEvent("resource-pick", {bubbles: true, composed: true, detail}))
			}
		}
	}

	render() {
		return html`
<div class="list">
	${ this.resources ? this.resources.map(r => html`<div class="resource" @click=${this.chooseResource} path="${r.path}" title="${r.name}.${r.ext}"><img src="${r.path}"/></div>`) : html`<sl-spinner style="font-size: 8rem;"></sl-spinner>`}

</div>
`;
	}
}
