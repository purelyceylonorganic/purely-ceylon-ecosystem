import express from "express";
import { getCurrencies } from "../controllers/currency.controller";

const router = express.Router();

router.get("/", getCurrencies);

export default router;