import express from "express";

import {
  getAllRFQsAdmin
} from "../controllers/adminRFQ.controller";

import { protect } from "../middlewares/auth.middleware";
import { authorizePermissions } from "../middlewares/permission.middleware";
import { PERMISSIONS } from "../constants/permissions";


const router = express.Router();


router.get(
  "/rfqs",
  protect,
  authorizePermissions(PERMISSIONS.RFQ_VIEW),
  getAllRFQsAdmin
);


export default router;