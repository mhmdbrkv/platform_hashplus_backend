import http from "http";
import app from "./src/app.js";
import { PORT, NODE_ENV, CLIENT_URL } from "./src/config/env.js";
import { gracefulShutdown } from "./src/config/server.js";
import { connectDatabase } from "./src/config/db.js";
let server;

// Error handlers
process.on("unhandledRejection", (err) => {
  console.error("🚨 UNHANDLED REJECTION! Shutting down...");
  console.error(err.name, err.message);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (err) => {
  console.error("🚨 UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Signal handlers
process.on("SIGTERM", () => gracefulShutdown(server, "SIGTERM"));
process.on("SIGINT", () => gracefulShutdown(server, "SIGINT"));

// Server startup
server = http.createServer(app);

const startServer = async () => {
  try {
    await connectDatabase();

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
    });

    // Increase timeout for long-polling fallback
    server.setTimeout(10 * 60 * 1000); // 10 minutes

    return server;
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the application
const serverInstance = startServer().catch((error) => {
  console.error("❌ Failed to start application:", error);
  process.exit(1);
});
