import mongoose from "mongoose";

const gracefulShutdown = async (server, signal) => {
  console.log(`📞 ${signal} received. Starting graceful shutdown...`);

  // Wait for HTTP server to close
  await new Promise((resolve) => {
    server.close(() => {
      console.log("🚫 HTTP server closed.");
      resolve();
    });
  });

  try {
    await mongoose.connection.close();
    console.log("📀 Database connection closed.");
  } catch (error) {
    console.error("Error closing database connection:", error);
  }

  console.log("👋 Process terminated.");
  process.exit(0);
};

export { gracefulShutdown };
