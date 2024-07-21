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

	private loadFromLocalStorage() {
		try {
			const raw = window.localStorage.getItem("wn-user-data") || "";
			if (!raw) {
				return;
			}
			const data = JSON.parse(raw);
			if (!data.id || data["wn-ls-version"] !== 1) {
				return;
			}
			this.state = data;
		} catch {
			this.state = null;
			window.localStorage.removeItem("wn-user-data");
		}
	}

	private saveInLocalStorage() {
		if (!this.state) {
			window.localStorage.removeItem("wn-user-data");
		} else {
			window.localStorage.setItem(
				"wn-user-data",
				JSON.stringify({ ...this.state, "wn-ls-version": 1 }),
			);
		}
	}

	constructor() {
		super();
		this.loadFromLocalStorage();
	}

	connectedCallback() {
		super.connectedCallback();

		setTimeout(async () => {
			const user = await getSelf();
			if (user) {
				this.state = user;
				this.saveInLocalStorage();
			}
		});

		window.addEventListener("userChange", (e: Event) => {
			if (!(e instanceof CustomEvent)) {
				console.error(e);
				throw new Error(`Invalid userChange event`);
			}
			this.state = e.detail ? e.detail : undefined;
			this.saveInLocalStorage();
		});
	}

	render() {
		return html`<slot></slot>`;
	}
}
