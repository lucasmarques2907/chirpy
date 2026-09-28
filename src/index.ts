import express from "express";
import { handlerReadiness } from "./app/api/readiness.js";
import {
  middlewareLogResponse,
  middlewareMetricsInc,
} from "./app/api/middleware.js";
import { handlerMetrics } from "./app/api/metrics.js";
import { handlerReset } from "./app/api/reset.js";

const app = express();
const PORT = 8080;

app.use(middlewareLogResponse);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/healthz", handlerReadiness);
app.get("/metrics", handlerMetrics);
app.get("/reset", handlerReset);

app.listen(PORT, () => {
  console.log(`Server is running at https://localhost:${PORT}`);
});
