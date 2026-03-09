import { Redis } from "@upstash/redis";

import { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } from "./env.js";

const appRedis = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
});

// Test connectivity at startup
appRedis
  .ping()
  .then(() => console.log("✅ App Redis connected"))
  .catch((err) => console.error("❌ App Redis error:", err.message));

export { appRedis };
