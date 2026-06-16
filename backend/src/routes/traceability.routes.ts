import express from "express";
import {
 createTraceability,
 getTraceability
} from "../controllers/traceability.controller";

const router = express.Router();

router.post("/", createTraceability);
router.get("/", getTraceability);

export default router;