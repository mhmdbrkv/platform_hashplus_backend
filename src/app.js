import express from "express";
import morgan from "morgan";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import { ApiError } from "./utils/apiError.js";
import errorMiddleware from "./middleware/error.middleware.js";
import mountRoutes from "./routes/index.js";
import { CLIENT_URL, NODE_ENV } from "./config/env.js";
import { moyasarWebhook } from "./controllers/webhook.controller.js";
import { scheduleDailySubscriptionReset } from "./cron/resetCron.js";
import { apiLimiter } from "./middleware/rateLimit.middleware.js";

const app = express();

// Webhook route
app.post(
  "/webhook/moyasar",
  express.raw({ type: "application/json" }),
  moyasarWebhook,
);

app.set("trust proxy", 1);

// Schedule daily subscription reset
scheduleDailySubscriptionReset();

// Configure CORS with specific options
const corsOptions = {
  origin: CLIENT_URL,
  credentials: true,
};

app.use(morgan(NODE_ENV === "development" ? "dev" : "combined"));
app.use(helmet());

app.use(compression());
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

// Apply API rate limiting to all routes
app.use("/api/", apiLimiter);

// Mount Routes
mountRoutes(app);

// Default Route
app.get("/", (req, res) => res.send("<h1>مرحبا بكم في هاش بلس!</h1>"));

app.use((req, res, next) => {
  next(new ApiError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorMiddleware);

export default app;
