import IORedis from "ioredis";

const appRedis = new IORedis({
  host: "127.0.0.1",
  port: 6379,
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
