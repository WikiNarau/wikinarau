import { Entry } from "./Entry";
import { Server } from "./Server";

const server = new Server({});
if (process.env.NODE_ENV === "development") {
	await server.devServer();
}
Entry.setFooter(`All content is available under the Creative Commons <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.en">CC BY-SA 4.0 License</a>.<br/>
By using this site, you agree to the <a href="/terms-of-use">Terms of Use</a> and <a href="/privacy">Privacy Policy</a>.`);
await server.listen();
console.log(`Server is running on http://${server.host}:${server.port}`);
