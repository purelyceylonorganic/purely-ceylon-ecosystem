import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { canonicalCountryName } from "../utils/countries";
import {
  getShippingOptions,
  seedStarterShipping,
} from "../services/ShippingRates.service";

// ======================================================
// 🧾 Validation
// ======================================================
const currencySchema = z.enum(["LKR", "USD"]);

const zoneSchema = z.object({
  name: z.string().trim().min(2, "Zone name is required").max(80),
  countries: z.array(z.string().trim().min(1)).max(300),
  isActive: z.boolean().optional(),
  isFallback: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

const methodSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_]{2,30}$/, "Code: 2-30 letters, numbers or underscore"),
  name: z.string().trim().min(2, "Method name is required").max(80),
  carrier: z.string().trim().max(80).optional().nullable(),
  description: z.string().trim().max(300).optional().nullable(),
  hasTracking: z.boolean().optional(),
  minDays: z.number().int().min(0).max(365).optional(),
  maxDays: z.number().int().min(0).max(365).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

const bandSchema = z.object({
  minGrams: z.number().int().min(0),
  maxGrams: z.number().int().min(0).nullable(),
  price: z.number().min(0),
  extraPerKg: z.number().min(0).nullable().optional(),
});

const zoneMethodSchema = z.object({
  zoneId: z.string().min(1),
  methodId: z.string().min(1),
  isEnabled: z.boolean(),
  currency: currencySchema,
  freeOverAmount: z.number().min(0).nullable().optional(),
  bands: z.array(bandSchema).max(60),
});

const firstIssue = (error: z.ZodError) => error.issues[0]?.message ?? "Validation failed";

// ======================================================
// 🛒 PUBLIC: Checkout-க்கான Shipping Options
// POST /api/v1/shipping-settings/options
// body: { country, currency, items: [{ productVariantId, quantity }] }
// எடை மற்றும் விலை server-ல் கணக்கிடப்படும் (client-ஐ நம்புவதில்லை)
// ======================================================
const optionsSchema = z.object({
  country: z.string().trim().min(2, "Country is required"),
  currency: currencySchema.default("LKR"),
  items: z
    .array(
      z.object({
        productVariantId: z.string().min(1),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, "No items"),
});

export const getOptionsController = async (req: Request, res: Response) => {
  try {
    const parsed = optionsSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ success: false, message: firstIssue(parsed.error) });
    }

    const { country, currency, items } = parsed.data;

    const variants = await prisma.productVariant.findMany({
      where: { id: { in: items.map((i) => i.productVariantId) } },
      select: { id: true, price: true, priceLKR: true, weightGrams: true },
    });

    let totalGrams = 0;
    let subtotal = 0;
    let missingWeight = false;

    for (const item of items) {
      const variant = variants.find((v) => v.id === item.productVariantId);

      if (!variant) {
        return res.status(404).json({ success: false, message: "Product variant not found" });
      }

      if (variant.weightGrams <= 0) missingWeight = true;

      totalGrams += variant.weightGrams * item.quantity;
      subtotal += (currency === "LKR" ? variant.priceLKR : variant.price) * item.quantity;
    }

    const result = await getShippingOptions({ country, currency, subtotal, totalGrams });

    return res.json({
      success: true,
      zone: result.zone,
      totalGrams,
      missingWeight,
      options: result.options,
    });
  } catch (error: any) {
    console.error("Shipping options error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to calculate shipping options",
    });
  }
};

// ======================================================
// 🧪 ADMIN: Rate Table-ஐச் சோதிக்க
// POST /api/v1/shipping-settings/test
// ======================================================
const testSchema = z.object({
  country: z.string().trim().min(2),
  currency: currencySchema.default("LKR"),
  totalGrams: z.number().int().min(0),
  subtotal: z.number().min(0).default(0),
});

export const testOptionsController = async (req: Request, res: Response) => {
  try {
    const parsed = testSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ success: false, message: firstIssue(parsed.error) });
    }

    const result = await getShippingOptions(parsed.data);

    return res.json({ success: true, zone: result.zone, options: result.options });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || "Test failed" });
  }
};

// ======================================================
// ⚙️ ADMIN: முழு அமைப்பு
// GET /api/v1/shipping-settings/config
// ======================================================
export const getConfigController = async (_req: Request, res: Response) => {
  try {
    const [zones, methods, zoneMethods] = await Promise.all([
      prisma.shippingZone.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
      prisma.shippingMethod.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
      prisma.shippingZoneMethod.findMany({
        include: { bands: { orderBy: { minGrams: "asc" } } },
      }),
    ]);

    return res.json({ success: true, data: { zones, methods, zoneMethods } });
  } catch (error) {
    console.error("Shipping config error:", error);
    return res.status(500).json({ success: false, message: "Failed to load shipping settings" });
  }
};

// ======================================================
// 🌱 ADMIN: Starter setup (வெற்று அமைப்பில் மட்டும்)
// ======================================================
export const seedController = async (_req: Request, res: Response) => {
  try {
    await seedStarterShipping();
    return res.status(201).json({ success: true, message: "Starter zones and methods created" });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error?.message || "Setup failed" });
  }
};

// ======================================================
// 🌍 ZONES
// ======================================================
async function countryConflicts(countries: string[], excludeZoneId?: string) {
  const zones = await prisma.shippingZone.findMany({
    where: excludeZoneId ? { NOT: { id: excludeZoneId } } : {},
    select: { name: true, countries: true },
  });

  const wanted = new Set(countries.map((c) => c.toLowerCase()));

  return zones
    .filter((zone) => zone.countries.some((c) => wanted.has(c.toLowerCase())))
    .map((zone) => zone.name);
}

function cleanCountries(list: string[]) {
  return Array.from(new Set(list.map(canonicalCountryName)));
}

export const createZoneController = async (req: Request, res: Response) => {
  try {
    const parsed = zoneSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ success: false, message: firstIssue(parsed.error) });
    }

    const { name, isActive, isFallback, sortOrder } = parsed.data;
    const countries = cleanCountries(parsed.data.countries);

    const duplicate = await prisma.shippingZone.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
    if (duplicate) {
      return res.status(409).json({ success: false, message: "A zone with this name already exists" });
    }

    const conflicts = await countryConflicts(countries);
    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Some countries already belong to: ${conflicts.join(", ")}`,
      });
    }

    const zone = await prisma.$transaction(async (tx) => {
      if (isFallback) {
        await tx.shippingZone.updateMany({ data: { isFallback: false } });
      }

      const created = await tx.shippingZone.create({
        data: {
          name,
          countries,
          ...(isActive !== undefined && { isActive }),
          ...(isFallback !== undefined && { isFallback }),
          ...(sortOrder !== undefined && { sortOrder }),
        },
      });

      // புதிய Zone-க்கு ஏற்கனவே உள்ள எல்லா Methods-ஐயும் (விலை இல்லாமல்) இணைக்கிறோம்
      const methods = await tx.shippingMethod.findMany({ select: { id: true } });
      if (methods.length > 0) {
        await tx.shippingZoneMethod.createMany({
          data: methods.map((m) => ({ zoneId: created.id, methodId: m.id, isEnabled: true })),
        });
      }

      return created;
    });

    return res.status(201).json({ success: true, message: "Zone created", data: zone });
  } catch (error) {
    console.error("Create zone error:", error);
    return res.status(500).json({ success: false, message: "Failed to create zone" });
  }
};

export const updateZoneController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = zoneSchema.partial().safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ success: false, message: firstIssue(parsed.error) });
    }

    const existing = await prisma.shippingZone.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Zone not found" });
    }

    const { name, isActive, isFallback, sortOrder } = parsed.data;
    const countries = parsed.data.countries ? cleanCountries(parsed.data.countries) : undefined;

    if (name) {
      const duplicate = await prisma.shippingZone.findFirst({
        where: { name: { equals: name, mode: "insensitive" }, NOT: { id } },
      });
      if (duplicate) {
        return res.status(409).json({ success: false, message: "A zone with this name already exists" });
      }
    }

    if (countries) {
      const conflicts = await countryConflicts(countries, id);
      if (conflicts.length > 0) {
        return res.status(409).json({
          success: false,
          message: `Some countries already belong to: ${conflicts.join(", ")}`,
        });
      }
    }

    const zone = await prisma.$transaction(async (tx) => {
      if (isFallback) {
        await tx.shippingZone.updateMany({ where: { NOT: { id } }, data: { isFallback: false } });
      }

      return tx.shippingZone.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(countries !== undefined && { countries }),
          ...(isActive !== undefined && { isActive }),
          ...(isFallback !== undefined && { isFallback }),
          ...(sortOrder !== undefined && { sortOrder }),
        },
      });
    });

    return res.json({ success: true, message: "Zone updated", data: zone });
  } catch (error) {
    console.error("Update zone error:", error);
    return res.status(500).json({ success: false, message: "Failed to update zone" });
  }
};

export const deleteZoneController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.shippingZone.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Zone not found" });
    }

    await prisma.shippingZone.delete({ where: { id } }); // rates cascade

    return res.json({ success: true, message: "Zone deleted" });
  } catch (error) {
    console.error("Delete zone error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete zone" });
  }
};

// ======================================================
// 📦 METHODS
// ======================================================
export const createMethodController = async (req: Request, res: Response) => {
  try {
    const parsed = methodSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ success: false, message: firstIssue(parsed.error) });
    }

    const data = parsed.data;

    if (data.minDays !== undefined && data.maxDays !== undefined && data.minDays > data.maxDays) {
      return res.status(400).json({ success: false, message: "Min days cannot be more than max days" });
    }

    const duplicate = await prisma.shippingMethod.findUnique({ where: { code: data.code } });
    if (duplicate) {
      return res.status(409).json({ success: false, message: "A method with this code already exists" });
    }

    const method = await prisma.$transaction(async (tx) => {
      const created = await tx.shippingMethod.create({
        data: { ...data, carrier: data.carrier || null, description: data.description || null },
      });

      const zones = await tx.shippingZone.findMany({ select: { id: true } });
      if (zones.length > 0) {
        await tx.shippingZoneMethod.createMany({
          data: zones.map((z) => ({ zoneId: z.id, methodId: created.id, isEnabled: true })),
        });
      }

      return created;
    });

    return res.status(201).json({ success: true, message: "Method created", data: method });
  } catch (error) {
    console.error("Create method error:", error);
    return res.status(500).json({ success: false, message: "Failed to create method" });
  }
};

export const updateMethodController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = methodSchema.partial().safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ success: false, message: firstIssue(parsed.error) });
    }

    const existing = await prisma.shippingMethod.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Method not found" });
    }

    const data = parsed.data;
    const minDays = data.minDays ?? existing.minDays;
    const maxDays = data.maxDays ?? existing.maxDays;

    if (minDays > maxDays) {
      return res.status(400).json({ success: false, message: "Min days cannot be more than max days" });
    }

    if (data.code && data.code !== existing.code) {
      const duplicate = await prisma.shippingMethod.findUnique({ where: { code: data.code } });
      if (duplicate) {
        return res.status(409).json({ success: false, message: "A method with this code already exists" });
      }
    }

    const method = await prisma.shippingMethod.update({
      where: { id },
      data: {
        ...data,
        ...(data.carrier !== undefined && { carrier: data.carrier || null }),
        ...(data.description !== undefined && { description: data.description || null }),
      },
    });

    return res.json({ success: true, message: "Method updated", data: method });
  } catch (error) {
    console.error("Update method error:", error);
    return res.status(500).json({ success: false, message: "Failed to update method" });
  }
};

export const deleteMethodController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.shippingMethod.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Method not found" });
    }

    await prisma.shippingMethod.delete({ where: { id } }); // rates cascade

    return res.json({ success: true, message: "Method deleted" });
  } catch (error) {
    console.error("Delete method error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete method" });
  }
};


// ======================================================
// 💰 ZONE × METHOD: இயக்கம், currency, இலவச வரம்பு, எடை வரம்பு விலைகள்
// PUT /api/v1/shipping-settings/zone-methods
// ======================================================
export const saveZoneMethodController = async (req: Request, res: Response) => {
  try {
    const parsed = zoneMethodSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ success: false, message: firstIssue(parsed.error) });
    }

    const { zoneId, methodId, isEnabled, currency, freeOverAmount } = parsed.data;

    // எடை வரம்புகளைச் சரிபார்த்தல்
    const bands = [...parsed.data.bands].sort((a, b) => a.minGrams - b.minGrams);

    for (let i = 0; i < bands.length; i++) {
      const band = bands[i];
      const isLast = i === bands.length - 1;

      if (band.maxGrams === null && !isLast) {
        return res.status(400).json({
          success: false,
          message: "Only the last weight band can be open-ended (empty max weight)",
        });
      }

      if (band.maxGrams !== null && band.maxGrams < band.minGrams) {
        return res.status(400).json({
          success: false,
          message: `Band ${band.minGrams}g: max weight cannot be less than min weight`,
        });
      }

      if (i > 0) {
        const previous = bands[i - 1];
        if (previous.maxGrams !== null && band.minGrams <= previous.maxGrams) {
          return res.status(400).json({
            success: false,
            message: `Weight bands overlap near ${band.minGrams}g`,
          });
        }
      }
    }

    const [zone, method] = await Promise.all([
      prisma.shippingZone.findUnique({ where: { id: zoneId }, select: { id: true } }),
      prisma.shippingMethod.findUnique({ where: { id: methodId }, select: { id: true } }),
    ]);

    if (!zone || !method) {
      return res.status(404).json({ success: false, message: "Zone or method not found" });
    }

    const saved = await prisma.$transaction(async (tx) => {
      const zoneMethod = await tx.shippingZoneMethod.upsert({
        where: { zoneId_methodId: { zoneId, methodId } },
        create: { zoneId, methodId, isEnabled, currency, freeOverAmount: freeOverAmount ?? null },
        update: { isEnabled, currency, freeOverAmount: freeOverAmount ?? null },
      });

      await tx.shippingRateBand.deleteMany({ where: { zoneMethodId: zoneMethod.id } });

      if (bands.length > 0) {
        await tx.shippingRateBand.createMany({
          data: bands.map((band) => ({
            zoneMethodId: zoneMethod.id,
            minGrams: band.minGrams,
            maxGrams: band.maxGrams,
            price: band.price,
            extraPerKg: band.maxGrams === null ? band.extraPerKg ?? null : null,
          })),
        });
      }

      return tx.shippingZoneMethod.findUniqueOrThrow({
        where: { id: zoneMethod.id },
        include: { bands: { orderBy: { minGrams: "asc" } } },
      });
    });

    return res.json({ success: true, message: "Rates saved", data: saved });
  } catch (error) {
    console.error("Save zone method error:", error);
    return res.status(500).json({ success: false, message: "Failed to save rates" });
  }
};