
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";

const deliveryRoute = prisma.deliveryRoute;

const routeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Route name must be at least 2 characters")
    .max(80),
  isActive: z.boolean().optional(),
});

// GET: எல்லா Delivery Routes-ஐயும் customer count உடன் பெறுதல்
export const getDeliveryRoutes = async (
  _req: Request,
  res: Response
) => {
  try {
    const routes = await deliveryRoute.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    return res.json({
      success: true,
      data: routes.map((route) => ({
        id: route.id,
        name: route.name,
        isActive: route.isActive,
        customerCount: route._count.users,
        createdAt: route.createdAt,
        updatedAt: route.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Get delivery routes error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load delivery routes",
    });
  }
};

// POST: புதிய Delivery Route உருவாக்குதல்
export const createDeliveryRoute = async (
  req: Request,
  res: Response
) => {
  try {
    const parsed = routeSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message:
          parsed.error.issues[0]?.message ?? "Validation failed",
      });
    }

    const { name, isActive } = parsed.data;

    const duplicate = await deliveryRoute.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
      },
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "A route with this name already exists",
      });
    }

    const route = await deliveryRoute.create({
      data: {
        name,
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Route created successfully",
      data: route,
    });
  } catch (error) {
    console.error("Create delivery route error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create delivery route",
    });
  }
};

// PUT: Delivery Route திருத்துதல்
export const updateDeliveryRoute = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const parsed = routeSchema.partial().safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message:
          parsed.error.issues[0]?.message ?? "Validation failed",
      });
    }

    const existing = await deliveryRoute.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    const { name, isActive } = parsed.data;

    if (name !== undefined) {
      const duplicate = await deliveryRoute.findFirst({
        where: {
          name: { equals: name, mode: "insensitive" },
          NOT: { id },
        },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "A route with this name already exists",
        });
      }
    }

    const route = await deliveryRoute.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });

    return res.json({
      success: true,
      message: "Route updated successfully",
      data: route,
    });
  } catch (error) {
    console.error("Update delivery route error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update delivery route",
    });
  }
};

// DELETE: Delivery Route நீக்குதல்
export const deleteDeliveryRoute = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const existing = await deliveryRoute.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    await deliveryRoute.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message:
        existing._count.users > 0
          ? `Route deleted. ${existing._count.users} customer(s) no longer have this route.`
          : "Route deleted successfully",
    });
  } catch (error) {
    console.error("Delete delivery route error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete delivery route",
    });
  }
};
