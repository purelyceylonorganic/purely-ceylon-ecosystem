import express from "express";
import { createBatch, getBatches } from "../controllers/batch.controller";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Batch Route Working"
  });
});

router.post("/", createBatch);
router.get("/", getBatches);

export default router;