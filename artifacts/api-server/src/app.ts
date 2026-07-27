import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Safe CORS handling (strips trailing slashes if present in env URL)
const rawFrontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, "");

const allowedOrigins = rawFrontendUrl
  ? [rawFrontendUrl, "http://localhost:3000", "http://localhost:5173"]
  : "*";

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Fallback Global Error Handler for Vercel/Pino Logging
app.use((err: any, req: any, res: any, next: any) => {
  logger.error({ err }, "Unhandled route error");
  res.status(500).json({ error: err?.message || "Internal server error" });
});

export default app;