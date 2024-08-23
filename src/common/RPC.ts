export interface RPCPacket {
	T: "RPC";
	calls: RPCCall[];
	replies: RPCReply[];
}

export interface RPCCall {
	id: number;
	fun: string;
	args: any;
}

export interface RPCReply {
	id: number;
	val: any;
	error: any;
}

interface RPCPromise {
	id: number;
	createdAt: Date;
	resolve: (v: any) => void;
	reject: (e: any) => void;
}

export class RPCQueue {
	calls: RPCCall[] = [];
	replies: RPCReply[] = [];
	private idCounter = 1;
	private promises = new Map<number, RPCPromise>();
	private _flush: () => void;
	private flushTO?: ReturnType<typeof setTimeout>;
	private callThis: any;
	private callMap = new Map<
		string,
		(v: unknown) => unknown | Promise<unknown>
	>();

	constructor(private flushHandler: (packet: RPCPacket) => boolean) {
		this._flush = this.flush.bind(this);
	}

	setCallThis(newThis: any) {
		this.callThis = newThis;
		return this;
	}

	setCallHandler(
		name: string,
		handler: (v: unknown) => unknown | Promise<unknown>,
	) {
		this.callMap.set(name, handler);
		return this;
	}

	flush() {
		this.flushTO = undefined;

		const packet = <RPCPacket>{
			T: "RPC",
			calls: this.calls,
			replies: this.replies,
		};

		if (this.flushHandler(packet)) {
			this.calls.length = 0;
			this.replies.length = 0;
		} else {
			this.flushTO = setTimeout(this._flush, 1);
		}
	}

	call(fun: string, args: any): Promise<any> {
		if (!this.flushTO) {
			this.flushTO = setTimeout(this._flush, 0);
		}
		return new Promise((resolve, reject) => {
			const id = this.idCounter++;
			const createdAt = new Date();
			this.promises.set(id, { id, createdAt, resolve, reject });
			this.calls.push({
				id,
				fun,
				args,
			});
		});
	}

	reply(id: number, val: any, error?: any) {
		if (!this.flushTO) {
			this.flushTO = setTimeout(this._flush, 0);
		}
		this.replies.push({
			id,
			val,
			error,
		});
	}

	private handleReply(reply: RPCReply) {
		const prom = this.promises.get(reply.id);
		if (!prom) {
			throw `Can't find promise for ${reply.id}`;
		}
		this.promises.delete(reply.id);
		if (reply.error) {
			prom.reject(reply.error);
		} else {
			prom.resolve(reply.val);
		}
	}

	private async handleCall(call: RPCCall) {
		const handler = this.callMap.get(call.fun);
		if (!handler) {
			throw "Invalid funcall: fun not mapped";
		}
		return await handler.call(this.callThis, call.args);
	}

	handlePacket(packet: RPCPacket) {
		if (packet.T !== "RPC") {
			throw `Invalid packet ${packet.T}`;
		}
		setTimeout(async () => {
			if (Array.isArray(packet.calls)) {
				for (const call of packet.calls) {
					if (typeof call.id !== "number") {
						continue;
					}
					try {
						if (typeof call.fun !== "string") {
							throw "Invalid funcall: fun is not a string";
						}
						this.reply(call.id, await this.handleCall(call));
					} catch (e) {
						if (typeof e === "string") {
							this.reply(call.id, undefined, e);
						} else {
							console.error(e);
							this.reply(call.id, undefined, "Error");
						}
					}
				}
			}
			if (Array.isArray(packet.replies)) {
				for (const reply of packet.replies) {
					this.handleReply(reply);
				}
			}
		});
	}
}
