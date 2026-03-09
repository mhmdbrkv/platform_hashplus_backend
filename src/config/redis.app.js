import IORedis from "ioredis";
import { REDIS_URL } from "./env.js";

const appRedis = new IORedis(REDIS_URL, {
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
