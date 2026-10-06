import { Router } from "express";

import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotificationController,
} from "../controllers/notification.controller";

import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/notifications",
  protect,
  getNotifications
);

router.get(
  "/notifications/unread-count",
  protect,
  getUnreadCount
);

router.patch(
  "/notifications/read-all",
  protect,
  markAllAsRead
);

router.patch(
  "/notifications/:id/read",
  protect,
  markAsRead
);

router.delete(
  "/notifications/:id",
  protect,
  deleteNotificationController
);

export default router;