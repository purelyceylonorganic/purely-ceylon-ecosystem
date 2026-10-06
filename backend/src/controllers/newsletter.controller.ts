import { Request, Response } from "express";
import { NewsletterService } from "../services/newsletter.service";
import { logger } from "../config/logger";

// ============================
// 📧 SUBSCRIBE TO NEWSLETTER
// ============================
export const subscribeNewsletter = async (
  req: Request,
  res: Response
) => {
  try {
    const { email } = req.body;

    // Basic validation
    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    const result =
      await NewsletterService.subscribe(email);

    // Already subscribed
    if (result.alreadySubscribed) {
      return res.status(200).json({
        success: true,
        alreadySubscribed: true,
        message: "This email is already subscribed",
      });
    }

    // New subscription / reactivation
    logger.info("Newsletter subscription successful", {
      email: email.toLowerCase().trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Successfully subscribed to newsletter",
    });
  } catch (error: any) {
    logger.error("Newsletter subscription failed", {
      error: error?.message,
    });

    return res.status(500).json({
      success: false,
      message: "Unable to subscribe to newsletter",
    });
  }
};

// ============================
// 📋 GET ACTIVE SUBSCRIBERS
// ============================
export const getNewsletterSubscribers = async (
  req: Request,
  res: Response
) => {
  try {
    const subscribers =
      await NewsletterService.getSubscribers();

    return res.status(200).json({
      success: true,
      count: subscribers.length,
      data: subscribers,
    });
  } catch (error: any) {
    logger.error("Failed to fetch newsletter subscribers", {
      error: error?.message,
    });

    return res.status(500).json({
      success: false,
      message: "Unable to fetch subscribers",
    });
  }
};