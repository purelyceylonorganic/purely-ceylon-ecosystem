import { Router } from "express";

import {
  subscribeNewsletter,
  getNewsletterSubscribers,
} from "../controllers/newsletter.controller";

const router = Router();

// 📧 Subscribe
router.post(
  "/subscribe",
  subscribeNewsletter
);

// 📋 Get subscribers
router.get(
  "/subscribers",
  getNewsletterSubscribers
);

export default router;