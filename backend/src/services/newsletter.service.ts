import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class NewsletterService {
  // ============================
  // 📧 SUBSCRIBE
  // ============================
  static async subscribe(email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    // Email validation
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      throw new Error("Invalid email address");
    }

    // Check existing subscriber
    const existingSubscriber =
      await prisma.newsletterSubscriber.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    // Already subscribed
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return {
          alreadySubscribed: true,
          subscriber: existingSubscriber,
        };
      }

      // Previously unsubscribed → activate again
      const reactivated =
        await prisma.newsletterSubscriber.update({
          where: {
            id: existingSubscriber.id,
          },
          data: {
            isActive: true,
          },
        });

      return {
        alreadySubscribed: false,
        reactivated: true,
        subscriber: reactivated,
      };
    }

    // Create new subscriber
    const subscriber =
      await prisma.newsletterSubscriber.create({
        data: {
          email: normalizedEmail,
        },
      });

    return {
      alreadySubscribed: false,
      reactivated: false,
      subscriber,
    };
  }

  // ============================
  // 📋 GET SUBSCRIBERS
  // ============================
  static async getSubscribers() {
    return prisma.newsletterSubscriber.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}