import express from "express";

import {
 createTaxRate,
 getTaxRates,
 getCountryTax,
 calculateTax
}
from "../controllers/tax.controller";

const router = express.Router();

router.post("/", createTaxRate);

router.get("/", getTaxRates);

router.get("/:country", getCountryTax);

router.post("/calculate", calculateTax);

export default router;