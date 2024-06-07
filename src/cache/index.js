import { redis } from "../config.js";
import { createClient } from "redis";
import Logger from "../core/Logger.js";

const redisURL = `redis://:${redis.password}@${redis.host}:${redis.port}`;
const client = createClient({ url: redis.url || redisURL });

Logger.debug(redis.url || redisURL);

client.on("connect", () => Logger.info("Cache is connecting"));
client.on("ready", () => Logger.info("Cache is ready"));
client.on("end", () => Logger.info("Cache disconnected"));
client.on("reconnecting", () => Logger.info("Cache is reconnecting"));
client.on("error", (error) => Logger.error(error.message));

(async () => {
  await client.connect();
})();

// If the Node process ends, close the Cache connection
process.on("SIGINT", async () => {
  await client.disconnect();
});

export default client;
