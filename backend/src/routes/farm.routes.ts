import express from "express";
import { createFarm, getFarms } from "../controllers/farm.controller";

const router = express.Router();

router.post("/", createFarm);
router.get("/", getFarms);

export default router;