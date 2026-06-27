import express from "express";

import {
  quoteRFQ,
  getPendingRFQs,
  acceptQuote,
  rejectQuote
} from "../controllers/adminQuote.controller";

const router = express.Router();
console.log("ADMIN QUOTE ROUTES LOADED");

router.get(
  "/pending-rfqs",
  getPendingRFQs
);

router.post(
  "/quote/:id",
  quoteRFQ
);

router.patch(
  "/accept/:id",
  acceptQuote
);

router.patch(
  "/reject/:id",
  rejectQuote
);

export default router;