import { Redis } from "ioredis";

import { REDIS_URL } from "./env.js";

const appRedis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
});

appRedis.on("connect", () => console.log("✅ App Redis connected"));
appRedis.on("error", (err) =>
  console.error("❌ App Redis error:", err.message),
);

export { appRedis };
