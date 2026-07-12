import { Router } from "express";
import {
  getNotifications
} from "../controllers/notification.controller";

const router = Router();

router.get(
  "/notifications",
  getNotifications
);

export default router;
