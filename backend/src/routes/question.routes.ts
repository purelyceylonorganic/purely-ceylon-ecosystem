import { Router } from "express";
import {
  askQuestion, // ✅ பெயர் மாற்றப்பட்டுள்ளது
  getProductQuestions,
  answerQuestion,
  deleteQuestion, // ✅ கன்ட்ரோலருடன் இணைக்கப்பட்டுள்ளது
} from "../controllers/question.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// Ask Question
router.post(
  "/:productId",
  protect,
  askQuestion // ✅ சரியான பங்க்ஷன் பெயர்
);

// Get Questions
router.get(
  "/:productId",
  getProductQuestions
);

// Seller/Admin Answer
router.put(
  "/answer/:id",
  protect,
  answerQuestion
);

// Delete Question
router.delete(
  "/:id",
  protect,
  deleteQuestion
);

export default router;