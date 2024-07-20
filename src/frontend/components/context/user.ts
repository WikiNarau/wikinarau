import { createContext, provide } from "@lit/context";
import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { getSelf } from "../../rpc";

export interface UserData {
	id: number | bigint;
	email: string;
	privilegeLevel: string;
	name: string;
	createdAt: Date;
}

export type UserState = UserData | null;
export const userStateContext = createContext<UserState>("frameState");

@customElement("wn-user-state")
export class UserStateElement extends LitElement {
	static styles = css`
	:host {
		display: grid;
		grid-template-rows: auto 1fr auto;
		height: 100%;
		min-height: 100%;
	}`;

	@provide({ context: userStateContext })
	state: UserState = null;

	connectedCallback() {
		super.connectedCallback();

		setTimeout(async () => {
			const user = await getSelf();
			if (user) {
				this.state = user;
			}
		});

		window.addEventListener("userChange", (e: Event) => {
			if (!(e instanceof CustomEvent)) {
				console.error(e);
				throw new Error(`Invalid userChange event`);
			}
			this.state = e.detail ? e.detail : undefined;
		});
	}

	render() {
		return html`<slot></slot>`;
	}
}
