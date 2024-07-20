import "./Database/seed";
import config from "./Config";
import { serverListen } from "./Server";

await serverListen();
console.log(`WikiNarau is running on ${config.baseUri}`);
