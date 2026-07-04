import express from "express";
import {
  createShipment,
  getShipmentByBulkOrder
} from "../controllers/shipment.controller";

const router = express.Router();

router.post("/", createShipment);

router.get("/bulk-order/:bulkOrderId", getShipmentByBulkOrder);

export default router;