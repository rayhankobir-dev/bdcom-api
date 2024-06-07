import dotenv from "dotenv";

// configuring dotenv to get environment variables
dotenv.config();

// server configuration
export const port = process.env.PORT || 4007;
export const host = process.env.HOST || "localhost";
export const environment = process.env.ENVIRONEMTN_MODE || "development";

// cors policy confiuration
export const corsConfig = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// db configuration
export const db = {
  url: process.env.DATABASE_URL || "",
  name: process.env.DATABASE_NAME || "",
  host: process.env.DATABASE_HOST || "",
  port: process.env.DATABASE_PORT || "",
  user: process.env.DATABASE_USER || "",
  password: process.env.DATABASE_PASSWORD || "",
  minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || "5"),
  maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || "10"),
};

// token configuration
export const tokenInfo = {
  accessTokenValidity: parseInt(process.env.ACCESS_TOKEN_VALIDITY_SEC || "0"),
  refreshTokenValidity: parseInt(process.env.REFRESH_TOKEN_VALIDITY_SEC || "0"),
  issuer: process.env.TOKEN_ISSUER || "",
  audience: process.env.TOKEN_AUDIENCE || "",
};

// redis configuration
export const redis = {
  url: process.env.REDIS_URL || "",
  host: process.env.REDIS_HOST || "",
  port: parseInt(process.env.REDIS_PORT || "0"),
  password: process.env.REDIS_PASSWORD || "",
};

// caching configuration
export const caching = {
  duration: parseInt(process.env.CONTENT_CACHE_DURATION_MILLIS || "600000"),
};

// logging directory
export const logDirectory = process.env.LOG_DIR;
