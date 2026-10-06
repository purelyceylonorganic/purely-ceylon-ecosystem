import { Response } from "express";

import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../services//notification/notification.service";

import { AuthenticatedRequest } from "../middlewares/auth.middleware";

/**
 * GET /notifications
 *
 * Get latest notifications for logged-in user
 */
export const getNotifications = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const notifications =
      await getUserNotifications(userId);

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error(
      "Get Notifications Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get notifications",
    });
  }
};

/**
 * GET /notifications/unread-count
 *
 * Get unread notification count
 */
export const getUnreadCount = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const count =
      await getUnreadNotificationCount(userId);

    return res.status(200).json({
      success: true,
      data: {
        count,
      },
    });
  } catch (error) {
    console.error(
      "Unread Notification Count Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get unread notification count",
    });
  }
};

/**
 * PATCH /notifications/:id/read
 *
 * Mark one notification as read
 */
export const markAsRead = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Notification ID is required",
      });
    }

    const notification =
      await markNotificationAsRead(
        id,
        userId
      );

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    console.error(
      "Mark Notification Read Error:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "Notification not found"
    ) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to mark notification as read",
    });
  }
};

/**
 * PATCH /notifications/read-all
 *
 * Mark all notifications as read
 */
export const markAllAsRead = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result =
      await markAllNotificationsAsRead(userId);

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: {
        updatedCount: result.count,
      },
    });
  } catch (error) {
    console.error(
      "Mark All Notifications Read Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to mark all notifications as read",
    });
  }
};

/**
 * DELETE /notifications/:id
 *
 * Delete one notification
 */
export const deleteNotificationController =
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Notification ID is required",
        });
      }

      await deleteNotification(
        id,
        userId
      );

      return res.status(200).json({
        success: true,
        message:
          "Notification deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete Notification Error:",
        error
      );

      if (
        error instanceof Error &&
        error.message === "Notification not found"
      ) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete notification",
      });
    }
  };