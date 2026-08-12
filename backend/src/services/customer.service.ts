import { prisma } from "../config/prisma";
import { normalizePhoneNumber } from "../utils/phoneNormalizer";
import bcrypt from "bcrypt";
import crypto from "crypto";

export const searchCustomerByPhone = async (phone: string) => {
  const normalizedPhone = normalizePhoneNumber(phone);  
  const customer = await prisma.user.findFirst({
    where: {
      phone: normalizedPhone,
      role: "CUSTOMER",
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
    },
  });
  return customer;
};
export const quickCreateCustomer = async (
  fullName: string,
  phone: string
) => {
  const normalizedPhone = normalizePhoneNumber(phone);

  // Check if customer already exists
  const existingCustomer = await prisma.user.findFirst({
    where: {
      phone: normalizedPhone,
      role: "CUSTOMER",
    },
  });

  if (existingCustomer) {
    throw new Error("Customer already exists");
  }

  // Generate temporary email
  const email = `customer_${normalizedPhone}_${Date.now()}@local.customer`;

  // Generate random password
  const randomPassword = crypto.randomUUID();

  // Hash password
  const passwordHash = await bcrypt.hash(randomPassword, 10);

  // Create customer
  const customer = await prisma.user.create({
    data: {
      fullName,
      phone: normalizedPhone,
      email: email,
      passwordHash,
      role: "CUSTOMER",
      isActive: true,
      isVerified: false,
    },
    select: {
      id: true,
      fullName: true,
      phone: true,
      email: true,
      createdAt: true,
    },
  });

  return customer;
};

export const addCustomerAddress = async (
  customerId: string,
  data: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    province?: string;
    postalCode?: string;
    country?: string;
    isDefault?: boolean;
  }
) => {
  const customer = await prisma.user.findUnique({
    where: {
      id: customerId,
      role: "CUSTOMER",
    },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  // If new address is default, remove default from existing addresses
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: {
        userId: customerId,
      },
      data: {
        isDefault: false,
      },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId: customerId,
      fullName: data.fullName,
      phone: normalizePhoneNumber(data.phone),
      street: data.street,
      city: data.city,
      province: data.province,
      postalCode: data.postalCode,
      country: data.country ?? "Sri Lanka",
      isDefault: data.isDefault ?? false,
    },
  });

  return address;
};

export const findCustomerProfile = async (id: string) => {
  const customer = await prisma.user.findUnique({
    where: {
      id,
    },

    select: {
      // ==========================================
      // CUSTOMER
      // ==========================================

      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      profileImage: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,

      // ==========================================
      // ADDRESSES
      // ==========================================

      addresses: true,

      // ==========================================
      // ORDERS
      // ==========================================

      orders: {
        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          status: true,
          paymentStatus: true,
          paymentMethod: true,
          paidAmount: true,
          balance: true,
          paidAt: true,

          shippingCost: true,
          shippingStatus: true,
          taxAmount: true,
          trackingId: true,

          currency: true,
          exchangeRate: true,
          totalFinal: true,
          totalUSD: true,

          createdAt: true,
          updatedAt: true,

          // ========================================
          // ORDER ADDRESS
          // ========================================

          address: true,

          // ========================================
          // ORDER ITEMS
          // ========================================

          items: {
            select: {
              id: true,
              quantity: true,
              price: true,
              productVariantId: true,

              productVariant: {
                select: {
                  id: true,
                  sku: true,
                  weight: true,
                  price: true,

                  product: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          },

          // ========================================
          // PAYMENTS
          // ========================================

          payments: true,
        },
      },

      // ==========================================
      // CUSTOMER NOTES
      // ==========================================

      notes: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!customer) {
    return null;
  }

  return customer;
};