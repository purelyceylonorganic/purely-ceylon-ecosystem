import express from "express";
import { protect } from "../middlewares/auth.middleware";
import {
  createTaxRate, getTaxRates, updateTaxRate, toggleTaxRate,
  deleteTaxRate, getCountryTax, calculateTax,
} from "../controllers/tax.controller";

const router = express.Router();

const authorizeAdmin: express.RequestHandler = (req, res, next) => {
  if ((req as any).user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

// பொது
router.post("/calculate", calculateTax);

// Admin மட்டும்
router.get("/", protect, authorizeAdmin, getTaxRates);
router.post("/", protect, authorizeAdmin, createTaxRate);
router.put("/:id", protect, authorizeAdmin, updateTaxRate);
router.patch("/:id/toggle", protect, authorizeAdmin, toggleTaxRate);
router.delete("/:id", protect, authorizeAdmin, deleteTaxRate);

// பொது (கடைசியில் இருக்க வேண்டும்)
router.get("/:country", getCountryTax);

export default router;