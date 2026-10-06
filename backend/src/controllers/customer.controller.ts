import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { ROLES } from "../constants/roles";
import { logger } from "../config/logger";
import { normalizePhoneNumber } from "../utils/phoneNormalizer";
import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  findCustomerProfile,
  updateCustomerAddressService,
  setDefaultCustomerAddressService,
  deleteCustomerAddressService,
  addCustomerAddress,
} from "../services/customer.service";


const prisma = new PrismaClient();



// ==========================================
// 1. SERVICE FUNCTIONS (Database Logic)
// ==========================================

export const searchCustomerByPhone = async (phone: string) => {
  return await prisma.user.findFirst({
    where: {
      phone: String(phone),
    },
    include: {
      addresses: true,

      orders: {
        include: {
          items: true,
          payments: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
};


export const searchCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const { phone } = req.query;

    if (!phone || typeof phone !== "string") {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const customer =
      await searchCustomerByPhone(phone);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer found",
      data: customer,
    });

  } catch (error: any) {
    console.error(
      "Customer Search Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal Server Error",
    });
  }
};


// =====================================================
// QUICK CREATE CUSTOMER
// =====================================================

export const createQuickCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const { fullName, phone } = req.body;

    // ==========================================
    // Validate
    // ==========================================

    if (!fullName?.trim() || !phone?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full Name and Phone Number are required",
      });
    }

    // ==========================================
    // Normalize Phone
    // ==========================================

    const normalizedPhone =
      normalizePhoneNumber(phone);

    // ==========================================
    // Duplicate Phone
    // ==========================================

    const existingCustomer =
      await prisma.user.findUnique({
        where: {
          phone: normalizedPhone,
        },
      });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message:
          "A customer with this phone number already exists.",
        data: {
          id: existingCustomer.id,
          fullName: existingCustomer.fullName,
          phone: existingCustomer.phone,
        },
      });
    }

    // ==========================================
    // Generate Temporary Password
    // ==========================================

    const temporaryPassword =
      crypto.randomBytes(6).toString("base64url");

    // ==========================================
    // Hash Temporary Password
    // ==========================================

    const hashedPassword =
      await bcrypt.hash(
        temporaryPassword,
        10
      );

    // ==========================================
    // Create Customer
    // ==========================================

    const customer =
      await prisma.user.create({
        data: {
          fullName: fullName.trim(),

          phone: normalizedPhone,

          // Email can be added later
          email: null,

          // Secure hashed temporary password
          passwordHash: hashedPassword,

          // Force password change on first login
          mustChangePassword: true,

          role: ROLES.CUSTOMER,

          // Admin-created customer
          isActive: true,
          isVerified: true,
        },

        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
          role: true,
          isActive: true,
          isVerified: true,
          mustChangePassword: true,
          createdAt: true,
        },
      });

    // ==========================================
    // Response
    // ==========================================

    return res.status(201).json({
      success: true,
      message:
        "Customer created successfully.",

      data: {
        customer,
        temporaryPassword,
      },
    });

  } catch (error: any) {

    logger.error(
      "Quick Create Customer Error",
      error
    );

    // ==========================================
    // Prisma Duplicate Constraint
    // ==========================================

    if (error?.code === "P2002") {
      return res.status(409).json({
        success: false,
        message:
          "A customer with this phone number already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create customer.",
    });
  }
};

// =====================================================
// CUSTOMER PROFILE - HTTP CONTROLLER
// =====================================================

export const customerProfile = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const customer = await findCustomerProfile(id);

    return res.status(200).json({
      success: true,
      data: customer,
    });

  } catch (error: any) {

    console.error(
      "Customer Profile Error:",
      error
    );

    return res.status(404).json({
      success: false,
      message:
        error.message || "Customer not found",
    });
  }
};
export const createCustomerAddress = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Customer ID is required",
      });
    }

    const address = await addCustomerAddress(
      id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: address,
    });
  } catch (error: any) {
    console.error(
      "Create Customer Address Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to add customer address",
    });
  }
};


// =====================================================
// CUSTOMER LIST
// =====================================================

export const getCustomers = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      search = "",
      status = "ALL",
    } = req.query;

    const where: any = {
      role: ROLES.CUSTOMER,
    };

    // ==========================================
    // STATUS FILTER
    // ==========================================

    if (status === "ACTIVE") {
      where.isActive = true;
    }

    if (status === "INACTIVE") {
      where.isActive = false;
    }

    // ==========================================
    // SEARCH
    // ==========================================

    if (
      typeof search === "string" &&
      search.trim()
    ) {
      where.OR = [
        {
          fullName: {
            contains: search.trim(),
            mode: "insensitive",
          },
        },
        {
          phone: {
            contains: search.trim(),
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search.trim(),
            mode: "insensitive",
          },
        },
      ];
    }

    // ==========================================
    // GET CUSTOMERS
    // ==========================================

    const customers =
      await prisma.user.findMany({
        where,

        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
          isActive: true,
          isVerified: true,
          createdAt: true,

          // ================================
          // ADDRESS
          // ================================

          addresses: {
            where: {
              isDefault: true,
            },

            select: {
              id: true,
              fullName: true,
              phone: true,
              street: true,
              city: true,
              province: true,
              postalCode: true,
              country: true,
              isDefault: true,
            },
          },

          // ================================
          // ORDERS
          // ================================

          orders: {
            orderBy: {
              createdAt: "desc",
            },

            take: 1,

            select: {
              id: true,
              createdAt: true,
              paymentStatus: true,
              paidAmount: true,
              balance: true,
              paymentMethod: true,
              shippingStatus: true,
              status: true,
              totalFinal: true,
              currency: true,
            },
          },

          // ================================
          // ORDER COUNT
          // ================================

          _count: {
            select: {
              orders: true,
              addresses: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    // ==========================================
    // FORMAT CUSTOMER DATA
    // ==========================================

    const formattedCustomers =
      customers.map((customer) => {
        const lastOrder =
          customer.orders[0] || null;

        const defaultAddress =
          customer.addresses[0] || null;

        return {
          id: customer.id,

          fullName: customer.fullName,

          phone: customer.phone,

          email: customer.email,

          isActive: customer.isActive,

          isVerified: customer.isVerified,

          createdAt: customer.createdAt,

          // Address
          address: defaultAddress,

          // Address count
          addressCount:
            customer._count.addresses,

          // Order information
          orderCount:
            customer._count.orders,

          // Last order
          lastOrder: lastOrder
            ? {
                id: lastOrder.id,
                date: lastOrder.createdAt,
                paymentStatus:
                  lastOrder.paymentStatus,
                paidAmount:
                  lastOrder.paidAmount,
                balance:
                  lastOrder.balance,
                paymentMethod:
                  lastOrder.paymentMethod,
                shippingStatus:
                  lastOrder.shippingStatus,
                status: lastOrder.status,
                total:
                  lastOrder.totalFinal,
                currency:
                  lastOrder.currency,
              }
            : null,

          // These will be added
          // when Delivery system is created
          deliveryRoute: null,
          dailyQuantity: null,
          lastDelivery: null,
        };
      });

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,

      total:
        formattedCustomers.length,

      data: formattedCustomers,
    });

  } catch (error: any) {

    console.error(
      "Customer List Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load customers.",
    });
  }
};

// =====================================================
// UPDATE CUSTOMER ADDRESS
// =====================================================

export const updateCustomerAddress = async (
  req: Request,
  res: Response
) => {
  try {
    const { id, addressId } = req.params;

    if (!id || !addressId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID and Address ID are required",
      });
    }

    const updatedAddress =
      await updateCustomerAddressService(
        id,
        addressId,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: updatedAddress,
    });
  } catch (error: any) {
    console.error(
      "Update Customer Address Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to update address",
    });
  }
};
export const deleteCustomerAddress = async (
  req: Request,
  res: Response
) => {
  try {
    const { id, addressId } = req.params;

    if (!id || !addressId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID and Address ID are required",
      });
    }

    const result =
      await deleteCustomerAddressService(
        id,
        addressId
      );

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      data: result,
    });
  } catch (error: any) {
    console.error(
      "Delete Customer Address Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to delete address",
    });
  }
};

export const setDefaultCustomerAddress = async (
  req: Request,
  res: Response
) => {
  try {
    const { id, addressId } = req.params;

    if (!id || !addressId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID and Address ID are required",
      });
    }

    const address =
      await setDefaultCustomerAddressService(
        id,
        addressId
      );

    return res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      data: address,
    });
  } catch (error: any) {
    console.error(
      "Set Default Address Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to set default address",
    });
  }
};


export const createCustomerNote = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const customer = await prisma.user.findUnique({
      where: { id }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    const customerNote = await prisma.customerNote.create({
      data: {
        customerId: id,
        note
      }
    });

    return res.status(201).json({
      success: true,
      message: "Customer note added successfully",
      data: customerNote
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getCustomerNotes = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const notes = await prisma.customerNote.findMany({
      where: {
        customerId: id
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.status(200).json({
      success: true,
      data: notes
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// =====================================================
// UPDATE CUSTOMER NOTE
// =====================================================

export const updateCustomerNote = async (
  req: Request,
  res: Response
) => {
  try {
    const { id, noteId } = req.params;
    const { note } = req.body;

    // Validate
    if (!note || !note.trim()) {
      return res.status(400).json({
        success: false,
        message: "Note is required",
      });
    }

    // Check customer
    const customer = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Check note belongs to customer
    const existingNote =
      await prisma.customerNote.findFirst({
        where: {
          id: noteId,
          customerId: id,
        },
      });

    if (!existingNote) {
      return res.status(404).json({
        success: false,
        message: "Customer note not found",
      });
    }

    // Update
    const updatedNote =
      await prisma.customerNote.update({
        where: {
          id: noteId,
        },
        data: {
          note: note.trim(),
        },
      });

    return res.status(200).json({
      success: true,
      message: "Customer note updated successfully",
      data: updatedNote,
    });

  } catch (error: any) {
    console.error(
      "Update Customer Note Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update customer note",
    });
  }
};

// =====================================================
// DELETE CUSTOMER NOTE
// =====================================================

export const deleteCustomerNote = async (
  req: Request,
  res: Response
) => {
  try {
    const { id, noteId } = req.params;

    // Check customer
    const customer = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Check note belongs to customer
    const existingNote =
      await prisma.customerNote.findFirst({
        where: {
          id: noteId,
          customerId: id,
        },
      });

    if (!existingNote) {
      return res.status(404).json({
        success: false,
        message: "Customer note not found",
      });
    }

    // Delete
    await prisma.customerNote.delete({
      where: {
        id: noteId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Customer note deleted successfully",
    });

  } catch (error: any) {
    console.error(
      "Delete Customer Note Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to delete customer note",
    });
  }
};

export const customerHistory = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const customer = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            payments: true,
            items: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: customer,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCustomerDashboardStats =
async (
  req: Request,
  res: Response
) => {
  try {

    const totalCustomers =
      await prisma.user.count({
        where: {
          role: "CUSTOMER"
        }
      });

    const activeCustomers =
      await prisma.user.count({
        where: {
          role: "CUSTOMER",
          isActive: true
        }
      });

    const orders =
      await prisma.order.findMany();

    const totalOrders =
      orders.length;

    const totalRevenue =
      orders.reduce(
        (sum, order) =>
          sum + order.totalFinal,
        0
      );

    return res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        totalOrders,
        totalRevenue
      }
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};