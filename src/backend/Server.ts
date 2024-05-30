import http from "node:http";
import { WebSocketServer } from "ws";
import { Socket } from "./Socket";
import express from "express";
import { createServer } from "vite";
import fsp from "node:fs/promises";
import { Database } from "./Database";
import { Entry } from "./Entry";
import { Resource } from "./Resource";

interface WebRequest {
	verb: "GET" | "POST";
	uri: string;
}

interface WebResponse {
	code: number;
	contentType: string;
	body: any;
}

export class Server {
	public readonly port: number;
	public readonly host: string;

	private server: http.Server | undefined;
	private devMode = false;
	private readonly app: express.Express;
	private readonly webSockets = new Set<Socket>();
	private readonly preRequestHandler: (() => Promise<void>)[] = [];
	readonly db: Database;

	closeSocket(socket: Socket) {
		this.webSockets.delete(socket);
	}

	/*
	broadcastMessage(msg: string, filter?: (sock: Socket) => boolean) {
		for (const socket of this.webSockets.values()) {
			if (filter && !filter(socket)) {
				continue;
			}
			socket.send(msg);
		}
	}
	*/

	constructor({ port = 2600, host = "localhost" }) {
		this.port = port;
		this.host = host;
		this.app = express();
		this.db = new Database();
	}

	async handleRequest(req: WebRequest): Promise<WebResponse> {
		const { uri } = req;
		if (uri.startsWith("/assets/")) {
			return <WebResponse>{
				code: 0,
			};
		}
		const entry = await Entry.getByURI(this.db, uri);
		if (entry) {
			return <WebResponse>{
				code: 200,
				contentType: "text/html",
				body: entry.renderHTML(),
			};
		} else {
			if (uri.startsWith("/search/")) {
				const sword = uri.substring("/search/".length);
				const entries = (await this.db.searchContent(sword))
					.map(Entry.fromContent)
					.map((e, i) => e.renderTeaser(i));
				const content =
					`<h1>Results for ${sword}</h1><br/>` + entries.join("<br/>");
				const html = Entry.renderTemplate(`Results for ${sword}`, content);
				return <WebResponse>{
					code: 200,
					contentType: "text/html",
					body: html,
				};
			} else {
				const content = `<h1>The page couldn't be found</h1>
				<p>Maybe you would like to create it?</p>
				<i6q-frame section="main">
					<i6q-code slot="code"></i6q-code>
				</i6q-frame>`;
				const html = Entry.renderTemplate("404 - Page Not Found", content);
				return <WebResponse>{
					code: 404,
					contentType: "text/html",
					body: html,
				};
			}
		}
	}

	async devServer() {
		console.error("Starting Dev Server!!!");
		const vite = await createServer({
			server: {
				middlewareMode: true,
			},
			appType: "custom",
		});
		this.app.use(vite.middlewares);
		this.devMode = true;

		let lastTemplateLoad = (await fsp.stat("index.html")).mtime;
		Entry.setTemplate(
			await vite.transformIndexHtml(
				"/",
				await fsp.readFile("index.html", "utf-8"),
			),
		);
		const reloadTemplate = async () => {
			const now = (await fsp.stat("index.html")).mtime;
			if (now > lastTemplateLoad) {
				console.log("Reloading template!");
				Entry.setTemplate(
					await vite.transformIndexHtml(
						"/",
						await fsp.readFile("index.html", "utf-8"),
					),
				);
				lastTemplateLoad = now;
			}
		};
		this.preRequestHandler.push(reloadTemplate);
	}

	async listen() {
		await this.db.init();
		await Resource.init();

		if (!this.devMode) {
			Entry.setTemplate(await fsp.readFile("./dist/index.html", "utf-8"));
			this.app.use(
				"/assets",
				express.static("./dist/assets", { maxAge: 7 * 24 * 60 * 60 * 1000 }),
			);
		}
		this.app.use(
			"/assets/shoelace/",
			express.static("./node_modules/@shoelace-style/shoelace/dist/", {
				maxAge: 7 * 24 * 60 * 60 * 1000,
			}),
		);
		this.app.use(
			"/res",
			express.static("./data/res", { maxAge: 7 * 24 * 60 * 60 * 1000 }),
		);

		this.app.use(async (req, res) => {
			try {
				for (const lambda of this.preRequestHandler) {
					await lambda();
				}
				const webReq = <WebRequest>{
					uri: req.originalUrl,
					verb: "GET",
				};
				console.log(webReq);
				const r = await this.handleRequest(webReq);
				if (r.code) {
					res.status(r.code).set({ "Content-Type": r.contentType }).end(r.body);
				}
			} catch (error) {
				console.error(error);
				res.status(500).end(Entry.renderTemplate("500 - Server Error", "Something went wrong on our end, we will try to fix this issue as soon as possible."));
			}
		});
		this.server = http.createServer(this.app);

		const wss = new WebSocketServer({ server: this.server, path: "/api-ws" });
		wss.on("connection", (ws) => {
			this.webSockets.add(new Socket(this, ws));
		});

		return new Promise<void>((resolve) => {
			this.server?.listen(this.port, this.host, resolve);
		});
	}
}
