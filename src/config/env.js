import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5050;
const CLIENT_URL = process.env.CLIENT_URL || "*";

const MONGODB_URI = process.env.MONGODB_URI || "";
const NODE_ENV = process.env.NODE_ENV || "development";
const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_URL = process.env.REDIS_URL || "";
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL || "";
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";

const JWT_ACCESS_SECRET_KEY = process.env.JWT_ACCESS_SECRET_KEY || "";
const JWT_ACCESS_EXPIRE_TIME = process.env.JWT_ACCESS_EXPIRE_TIME || "";
const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY || "";
const JWT_REFRESH_EXPIRE_TIME = process.env.JWT_REFRESH_EXPIRE_TIME || "";

const EMAIL_HOST = process.env.EMAIL_HOST || "";
const EMAIL_PORT = process.env.EMAIL_PORT || "";
const EMAIL_USER = process.env.EMAIL_USER || "";
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || "";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";

const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_ENDPOINT = process.env.R2_ENDPOINT || "";
const R2_BUCKET = process.env.R2_BUCKET || "";

const MOYASAR_SECRET_KEY = process.env.MOYASAR_SECRET_KEY || "";
const MOYASAR_WEBHOOK_SECRET = process.env.MOYASAR_WEBHOOK_SECRET || "";

export {
  PORT,
  CLIENT_URL,
  MONGODB_URI,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_URL,
  UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN,
  NODE_ENV,
  JWT_ACCESS_SECRET_KEY,
  JWT_ACCESS_EXPIRE_TIME,
  JWT_REFRESH_SECRET_KEY,
  JWT_REFRESH_EXPIRE_TIME,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASSWORD,
  GOOGLE_CLIENT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_ENDPOINT,
  R2_BUCKET,
  MOYASAR_SECRET_KEY,
  MOYASAR_WEBHOOK_SECRET,
};
