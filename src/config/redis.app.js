import { Redis } from "ioredis";

import { REDIS_HOST, REDIS_PORT, REDIS_URL } from "./env.js";

// Without Docker (Upstash)
// const appRedis = new Redis(REDIS_URL, {
//   maxRetriesPerRequest: 3,
// });

// With Docker
const appRedis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: 3,
});

appRedis.on("connect", () => console.log("✅ App Redis connected"));
appRedis.on("error", (err) =>
  console.error("❌ App Redis error:", err.message),
);

export { appRedis };
