import express from "express";
import { handlerReadiness } from "./app/api/readiness.js";
import {
  errorMiddleware,
  middlewareLogResponse,
  middlewareMetricsInc,
} from "./app/api/middleware.js";
import { handlerMetrics } from "./app/api/metrics.js";
import { handlerReset } from "./app/api/reset.js";
import { handlerChirpsValidate } from "./app/api/chirps.js";

const app = express();
const PORT = 8080;

app.use(middlewareLogResponse);
app.use(express.json());

app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/healthz", (req, res, next) => {
  Promise.resolve(handlerReadiness(req, res)).catch(next);
});
app.get("/admin/metrics", (req, res, next) => {
  Promise.resolve(handlerMetrics(req, res)).catch(next);
});
app.post("/admin/reset", (req, res, next) => {
  Promise.resolve(handlerReset(req, res)).catch(next);
});

app.post("/api/validate_chirp", (req, res, next) => {
  Promise.resolve(handlerChirpsValidate(req, res)).catch(next);
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running at https://localhost:${PORT}`);
});
