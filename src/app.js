import cors from "cors";
import path from "path";
import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { corsConfig, environment, port } from "./config.js";
import routes from "./routes/index.js";
import { createServer } from "http";
import { initializeSocket } from "./database/services/socket.service.js";
import {
  ApiError,
  ErrorType,
  InternalError,
  NotFoundError,
} from "./core/ApiError.js";

// initialize database
import "./database/index.js";
// initialize cache
import "./cache/index.js";
import Logger from "./core/Logger.js";
import swaggerDocs from "./helpers/swagger.js";

// defining express app
const app = express();
export const server = createServer(app);
initializeSocket(server);

app.use(express.json({ limit: "10mb" }));
app.use(cors(corsConfig));
app.use(cookieParser());
app.use(
  bodyParser.urlencoded({
    limit: "10mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(express.static(path.join(process.cwd(), "public")));

// handle api routes
app.use("/api/v1", routes);
swaggerDocs(app, port);

// catch 404 and forward to error handler
app.use((req, res, next) => next(new NotFoundError()));

// error middleare
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    ApiError.handle(err, res);
    if (err.type === ErrorType.INTERNAL) {
      Logger.error(
        `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
      );
    }
  } else {
    Logger.error(
      `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );
    Logger.error(err);
    if (environment === "development") {
      return res.status(500).send(err);
    }
    ApiError.handle(new InternalError(), res);
  }
});

// exporting express app
export default app;
