import express from "express";

import{

getSalesSummary,
getShipmentReport,
getBuyerReport

} from "../controllers/report.controller";

const router=express.Router();

router.get("/sales",getSalesSummary);

router.get("/shipment",getShipmentReport);

router.get("/buyers",getBuyerReport);

export default router;