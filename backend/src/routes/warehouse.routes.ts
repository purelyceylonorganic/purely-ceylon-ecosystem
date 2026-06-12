import express from "express";
import { createWarehouse, getWarehouses } from "../controllers/warehouse.controller";

const router = express.Router();

router.post("/", createWarehouse);
router.get("/", getWarehouses);

export default router;