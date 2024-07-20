import http from "node:http";
import fsp from "node:fs/promises";

import { WebSocketServer } from "ws";
import cookieParser from "cookie-parser";
import express from "express";

import { Socket } from "./Socket";
import { Entry } from "./Entry";
import { Resource } from "./Resource";
import config from "./Config";
import { Session } from "./Session";
import { initDB, searchContent } from "./db";

interface WebRequest {
	verb: "GET" | "POST";
	uri: string;
}

interface WebResponse {
	code: number;
	contentType: string;
	body: any;
}

let server: http.Server | undefined;
const app = express();
const webSockets = new Set<Socket>();
const preRequestHandler: (() => Promise<void>)[] = [];

export const closeSocket = (socket: Socket) => {
	webSockets.delete(socket);
};

const parseUri = (raw: string): [string, Record<string, string>] => {
	const args: Record<string, string> = {};
	const parsed = new URL(`http://localhost${raw}`);
	for (const [key, val] of parsed.searchParams.entries()) {
		args[key] = val;
	}
	return [parsed.pathname, args];
};

const handleRequest = async (req: WebRequest): Promise<WebResponse> => {
	const [uri, args] = parseUri(req.uri);
	if (uri.startsWith("/assets/")) {
		return <WebResponse>{
			code: 0,
		};
	}

	const entry = await Entry.getByURI(uri, args.revision || "");
	if (entry) {
		return <WebResponse>{
			code: 200,
			contentType: "text/html",
			body: entry.renderHTML(),
		};
	} else {
		if (uri.startsWith("/search/")) {
			const sword = uri.substring("/search/".length);
			const entries = (await searchContent(sword))
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
			<wn-frame section="main">
				<wn-code slot="code"></wn-code>
			</wn-frame>`;
			const html = Entry.renderTemplate("404 - Page Not Found", content);
			return <WebResponse>{
				code: 404,
				contentType: "text/html",
				body: html,
			};
		}
	}
};

const devServer = async () => {
	console.error("Starting Dev Server!!!");
	const { createServer } = await import("vite");
	const vite = await createServer({
		server: {
			middlewareMode: true,
		},
		appType: "custom",
	});
	app.use(vite.middlewares);
	app.use(cookieParser());

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
	preRequestHandler.push(reloadTemplate);
};

const parseCookiesRaw = (req: http.IncomingMessage) => {
	const ret: Record<string, string> = {};
	const cookies = (req.headers.cookie || "").split(";");
	for (const cookie of cookies) {
		const s = cookie.split("=");
		if (s.length === 2) {
			const key = s[0];
			const val = decodeURIComponent(s[1]);
			ret[key] = val;
		}
	}
	return ret;
};

export const serverListen = async () => {
	Entry.setFooter(config.footer);
	if (config.devMode) {
		await devServer();
	}
	await initDB();
	await Resource.init();

	if (!config.devMode) {
		Entry.setTemplate(await fsp.readFile("./dist/index.html", "utf-8"));
		app.use(
			"/assets",
			express.static("./dist/assets", { maxAge: 7 * 24 * 60 * 60 * 1000 }),
		);
	}
	app.use(
		"/assets/shoelace/",
		express.static("./node_modules/@shoelace-style/shoelace/dist/", {
			maxAge: 7 * 24 * 60 * 60 * 1000,
		}),
	);
	app.use(
		"/res",
		express.static("./data/res", { maxAge: 7 * 24 * 60 * 60 * 1000 }),
	);
	app.use("/api-session", async (req, res) => {
		try {
			if (!req.cookies?.wikinarauSession) {
				const session = await Session.create();
				res.cookie("wikinarauSession", session.id, {
					maxAge: 900000,
					httpOnly: true,
				});
			} else {
				const session = await Session.get(req.cookies?.wikinarauSession || "");
				if (!session) {
					const session = await Session.create();
					res.cookie("wikinarauSession", session.id, {
						maxAge: 900000,
						httpOnly: true,
					});
				}
			}
			res.end("");
		} catch (e) {
			res.status(500).end("500 - Server Error");
			console.error(e);
		}
	});

	app.use(async (req, res) => {
		try {
			for (const lambda of preRequestHandler) {
				await lambda();
			}
			const webReq = <WebRequest>{
				uri: req.originalUrl,
				verb: "GET",
			};
			console.log(webReq);
			const r = await handleRequest(webReq);
			if (r.code) {
				res.status(r.code).set({ "Content-Type": r.contentType }).end(r.body);
			}
		} catch (error) {
			console.error(error);
			res
				.status(500)
				.end(
					Entry.renderTemplate(
						"500 - Server Error",
						"Something went wrong on our end, we will try to fix this issue as soon as possible.",
					),
				);
		}
	});
	server = http.createServer(app);

	const wss = new WebSocketServer({ server: server, path: "/api-ws" });
	wss.on("connection", async (ws, req) => {
		const cookies = parseCookiesRaw(req);
		const session = await Session.get(cookies?.wikinarauSession || "");
		if (session) {
			webSockets.add(new Socket(ws, session));
		} else {
			ws.close();
		}
	});

	return new Promise<void>((resolve) => {
		server?.listen(config.port, config.bindAddress, resolve);
	});
};
