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

// =====================================================
// ADDRESS TYPES
// =====================================================

export interface CustomerAddressData {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  province?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}


// =====================================================
// ADD CUSTOMER ADDRESS
// =====================================================

export const addCustomerAddress = async (
  customerId: string,
  data: CustomerAddressData
) => {

  // ------------------------------------------
  // Check customer
  // ------------------------------------------

  const customer = await prisma.user.findFirst({
    where: {
      id: customerId,
      role: "CUSTOMER",
    },
    select: {
      id: true,
    },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }


  // ------------------------------------------
  // Check existing addresses
  // ------------------------------------------

  const addressCount = await prisma.address.count({
    where: {
      userId: customerId,
    },
  });


  // ------------------------------------------
  // First address automatically becomes default
  // ------------------------------------------

  const shouldBeDefault =
    addressCount === 0 || data.isDefault === true;


  // ------------------------------------------
  // Transaction
  // ------------------------------------------

  const address = await prisma.$transaction(
    async (tx) => {

      // Remove previous default
      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: {
            userId: customerId,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }


      // Create address
      const newAddress =
        await tx.address.create({
          data: {
            userId: customerId,

            fullName: data.fullName.trim(),

            phone: normalizePhoneNumber(
              data.phone
            ),

            street: data.street.trim(),

            city: data.city.trim(),

            province:
              data.province?.trim() || null,

            postalCode:
              data.postalCode?.trim() || null,

            country:
              data.country?.trim() ||
              "Sri Lanka",

            isDefault: shouldBeDefault,
          },
        });

      return newAddress;
    }
  );


  return address;
};


// =====================================================
// UPDATE CUSTOMER ADDRESS
// =====================================================

export const updateCustomerAddressService = async (
  customerId: string,
  addressId: string,
  data: CustomerAddressData
) => {

  // ------------------------------------------
  // Check address belongs to customer
  // ------------------------------------------

  const existingAddress =
    await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: customerId,
      },
    });

  if (!existingAddress) {
    throw new Error(
      "Address not found"
    );
  }


  // ------------------------------------------
  // Determine default status
  // ------------------------------------------

  const shouldBeDefault =
    data.isDefault === true;


  // ------------------------------------------
  // Transaction
  // ------------------------------------------

  const address =
    await prisma.$transaction(
      async (tx) => {

        // --------------------------------------
        // If this address becomes default,
        // remove default from other addresses
        // --------------------------------------

        if (shouldBeDefault) {

          await tx.address.updateMany({
            where: {
              userId: customerId,

              id: {
                not: addressId,
              },

              isDefault: true,
            },

            data: {
              isDefault: false,
            },
          });
        }


        // --------------------------------------
        // Update address
        // --------------------------------------

        const updatedAddress =
          await tx.address.update({
            where: {
              id: addressId,
            },

            data: {
              fullName:
                data.fullName.trim(),

              phone:
                normalizePhoneNumber(
                  data.phone
                ),

              street:
                data.street.trim(),

              city:
                data.city.trim(),

              province:
                data.province?.trim() ||
                null,

              postalCode:
                data.postalCode?.trim() ||
                null,

              country:
                data.country?.trim() ||
                "Sri Lanka",

              isDefault:
                shouldBeDefault,
            },
          });

        return updatedAddress;
      }
    );


  return address;
};


// =====================================================
// SET DEFAULT CUSTOMER ADDRESS
// =====================================================

export const setDefaultCustomerAddressService = async (
  customerId: string,
  addressId: string
) => {

  // ------------------------------------------
  // Check ownership
  // ------------------------------------------

  const address =
    await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: customerId,
      },

      select: {
        id: true,
      },
    });


  if (!address) {
    throw new Error(
      "Address not found"
    );
  }


  // ------------------------------------------
  // Transaction
  // ------------------------------------------

  await prisma.$transaction(
    async (tx) => {

      // Remove old default
      await tx.address.updateMany({
        where: {
          userId: customerId,

          id: {
            not: addressId,
          },
        },

        data: {
          isDefault: false,
        },
      });


      // Set new default
      await tx.address.update({
        where: {
          id: addressId,
        },

        data: {
          isDefault: true,
        },
      });
    }
  );


  // ------------------------------------------
  // Return updated address
  // ------------------------------------------

  return await prisma.address.findUnique({
    where: {
      id: addressId,
    },
  });
};


// =====================================================
// DELETE CUSTOMER ADDRESS
// =====================================================

export const deleteCustomerAddressService = async (
  customerId: string,
  addressId: string
) => {

  // ------------------------------------------
  // Check ownership
  // ------------------------------------------

  const address =
    await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: customerId,
      },
    });


  if (!address) {
    throw new Error(
      "Address not found"
    );
  }


  // ------------------------------------------
  // Delete address
  // ------------------------------------------

  await prisma.address.delete({
    where: {
      id: addressId,
    },
  });


  // ------------------------------------------
  // If deleted address was default,
  // make another address default
  // ------------------------------------------

  if (address.isDefault) {

    const nextAddress =
      await prisma.address.findFirst({
        where: {
          userId: customerId,
        },

        orderBy: {
          createdAt: "asc",
        },
      });


    if (nextAddress) {

      await prisma.address.update({
        where: {
          id: nextAddress.id,
        },

        data: {
          isDefault: true,
        },
      });

      return {
        deletedAddressId: addressId,
        newDefaultAddressId:
          nextAddress.id,
      };
    }
  }


  return {
    deletedAddressId: addressId,
    newDefaultAddressId: null,
  };
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