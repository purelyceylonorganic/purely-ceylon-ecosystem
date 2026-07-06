import express from "express";

import {

getAdminDashboard,

getBuyerDashboard

} from "../controllers/dashboard.controller";

const router = express.Router();

router.get(
"/admin",
getAdminDashboard
);

router.get(
"/buyer/:buyerId",
getBuyerDashboard
);

export default router;