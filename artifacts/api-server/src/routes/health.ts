import { Router } from "express";

const router = Router();
import { HealthCheckResponse } from "@workspace/api-zod";



router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
