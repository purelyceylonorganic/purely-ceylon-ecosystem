import { Request, Response } from "express";

export const calculateExportShipping = async (req: Request, res: Response) => {
  try {
    const { lengthCm, widthCm, heightCm, weightKg, targetCountry } = req.body;

    // 1. Validate presence
    if (
      lengthCm == null ||
      widthCm == null ||
      heightCm == null ||
      weightKg == null
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing dimensions or weight",
      });
    }

    // 2. Convert to numbers
    const length = Number(lengthCm);
    const width = Number(widthCm);
    const height = Number(heightCm);
    const weight = Number(weightKg);

    // 3. Validate numeric values
    if (isNaN(length) || isNaN(width) || isNaN(height) || isNaN(weight)) {
      return res.status(400).json({
        success: false,
        message: "Invalid numeric values",
      });
    }

    // 4. Volumetric Weight Calculation
    const volumetricWeight = Number(((length * width * height) / 5000).toFixed(2));
    const chargeableWeight = Number(
      Math.max(weight, volumetricWeight).toFixed(2)
    );

    // 5. Pricing logic
    const baseRate = 20;
    const internationalCostUSD = Number(
      (baseRate + chargeableWeight * 5).toFixed(2)
    );

    return res.status(200).json({
      success: true,
      corporateHandle: "Purely Ceylon Organic (Pvt) Ltd",
      logisticsData: {
        volumetricWeightKg: volumetricWeight,
        chargeableWeightKg: chargeableWeight,
        estimatedCostUSD: internationalCostUSD,
        customsDeclarationRequired: true,
        hsCode: "0908.11.00",
        targetCountry: targetCountry || null,
        taxExemptStatus: "ZERO_RATED_EXPORT",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal System Error",
    });
  }
};