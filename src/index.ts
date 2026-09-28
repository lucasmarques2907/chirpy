import express from "express";
import { handlerReadiness } from "./app/api/readiness.js";

const app = express();
const PORT = 8080;

app.use("/app", express.static("./src/app"));

app.get("/healthz", handlerReadiness);

app.listen(PORT, () => {
  console.log(`Server is running at https://localhost:${PORT}`);
});
