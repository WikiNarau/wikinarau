import { Server } from "./Server";
import "./DatabaseSeed";

const server = new Server();
await server.listen();
console.log(`WikiNarau is running on ${server.config.baseUri}`);
