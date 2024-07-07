import { Server } from "./Server";
import "./DatabaseSeed";
import config from "./Config";

const server = new Server();
await server.listen();
console.log(`WikiNarau is running on ${config.baseUri}`);
