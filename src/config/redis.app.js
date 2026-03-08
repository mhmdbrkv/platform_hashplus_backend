import IORedis from "ioredis";
import { REDIS_HOST, REDIS_PORT } from "./env.js";

const appRedis = new IORedis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: 5,
  enableReadyCheck: true,
});

appRedis.on("connect", () => {
  console.log("✅ App Redis connected");
});

appRedis.on("error", (err) => {
  console.error("❌ App Redis error:", err.message);
});

export { appRedis };
