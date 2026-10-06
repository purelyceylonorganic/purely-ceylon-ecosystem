import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Create a notification for a specific user
 */
export const createNotification = async ({
  userId,
  title,
  message,
  type,
}: {
  userId: string;
  title: string;
  message: string;
  type: string;
}) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
    },
  });

  return notification;
};

/**
 * Get latest notifications for a user
 */
export const getUserNotifications = async (
  userId: string,
  limit = 20
) => {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  return notifications;
};

/**
 * Get unread notification count
 */
export const getUnreadNotificationCount = async (
  userId: string
) => {
  const count = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });

  return count;
};

/**
 * Mark one notification as read
 */
export const markNotificationAsRead = async (
  notificationId: string,
  userId: string
) => {
  const notification =
    await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

  if (!notification) {
    throw new Error("Notification not found");
  }

  if (notification.isRead) {
    return notification;
  }

  const updatedNotification =
    await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
      },
    });

  return updatedNotification;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (
  userId: string
) => {
  const result =
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

  return result;
};

/**
 * Delete one notification
 */
export const deleteNotification = async (
  notificationId: string,
  userId: string
) => {
  const notification =
    await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

  if (!notification) {
    throw new Error("Notification not found");
  }

  await prisma.notification.delete({
    where: {
      id: notificationId,
    },
  });

  return notification;
};