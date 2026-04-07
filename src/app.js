import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import errorHandler from "./middleware/error-handler.js";
import userRoutes from "./routes/user.routes.js";

const sanitize = (obj) => {
  if (typeof obj !== "object" || obj === null) return obj;
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
    } else {
      obj[key] = sanitize(obj[key]);
    }
  }
  return obj;
};

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  if (req.body) sanitize(req.body);
  next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use("/api/user", userRoutes);

app.use(errorHandler);

export default app;
