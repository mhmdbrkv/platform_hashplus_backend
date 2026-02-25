import mongoose from "mongoose";
import { MONGODB_URI } from "./env.js";

let isConnected = false;

const connectDatabase = async () => {
  if (isConnected) {
    console.log("Using existing MongoDB connection");
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
      family: 4,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log("✅ MongoDB connected successfully");

    const dbHost = mongoose.connection.host;
    const dbName = mongoose.connection.name;
    console.log(`📊 Database: ${dbName} on ${dbHost}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error; // Don't exit in serverless
  }
};

export { connectDatabase };
