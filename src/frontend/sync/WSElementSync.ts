export class WSElementSync {
	private observer: MutationObserver;
	private ws: WebSocket;
	private wsQueue = <any>[];

	constructor(public root: HTMLElement) {
		this.observer = new MutationObserver((mutationList) => {
			for (const mutation of mutationList) {
				if (mutation.type === "childList") {
					console.log("A child node has been added or removed.");
				} else if (mutation.type === "attributes") {
					if (
						mutation.target instanceof HTMLElement &&
						mutation.attributeName
					) {
						const { target } = mutation;
						if (target.hasAttribute(mutation.attributeName)) {
							this.localAttributeSet(
								target.id,
								mutation.attributeName,
								target.getAttribute(mutation.attributeName) || "",
							);
						} else {
							this.localAttributeRemove(target.id, mutation.attributeName);
						}
					}
				}
			}
		});
		this.observer.observe(root, {
			attributes: true,
			childList: true,
			subtree: true,
		});

		this.ws = new WebSocket(`ws://${location.host}/api-ws`);
		this.ws.addEventListener("message", this.onMessage.bind(this));
	}

	private onMessage(msg: any) {
		try {
			const o = JSON.parse(msg.data);
			switch (o.T) {
				case "attributeSet":
					this.remoteAttributeSet(o.id, o.name, o.value);
					break;
				case "attributeRemove":
					this.remoteAttributeRemove(o.id, o.name);
					break;
				default:
					console.error(o);
					break;
			}
		} catch (e) {
			console.error(e);
		}
	}

	private send(r: any) {
		this.wsQueue.push(r);
		if (this.ws.readyState === this.ws.OPEN) {
			for (const o of this.wsQueue) {
				this.ws.send(JSON.stringify(o));
			}
			this.wsQueue.length = 0;
		}
	}

	private remoteAttributeSet(id: string, name: string, value: string) {
		const target = this.root.querySelector(`#${id}`);
		if (!target) {
			throw new Error(`Unknown remote attribute id ${id}`);
		}
		if (target.getAttribute(name) === value) {
			return;
		}
		target.setAttribute(name, value);
	}

	private remoteAttributeRemove(id: string, name: string) {
		const target = this.root.querySelector(`#${id}`);
		if (!target) {
			throw new Error(`Unknown remote attribute id ${id}`);
		}
		if (!target.hasAttribute(name)) {
			return;
		}
		target.removeAttribute(name);
	}

	private localAttributeSet(id: string, name: string, value: string) {
		this.send({
			T: "attributeSet",
			id,
			name,
			value,
		});
	}

	private localAttributeRemove(id: string, name: string) {
		this.send({
			T: "attributeRemove",
			id,
			name,
		});
	}
}
