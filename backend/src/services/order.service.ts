import {prisma} from "../config/prisma";

export const createAdminOrder = async (
  customerId: string,
  addressId: string
) => {
  // Check Customer
  const customer = await prisma.user.findUnique({
    where: {
      id: customerId,
      role: "CUSTOMER",
    },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  // Check Address
  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId: customerId,
    },
  });

  if (!address) {
    throw new Error("Address not found");
  }

  // Create Empty Order
  const order = await prisma.order.create({
    data: {
      userId: customerId,
      addressId,
      currency: "LKR",
      exchangeRate: 1,
      totalUSD: 0,
      totalFinal: 0,
    },
    select: {
      id: true,
      status: true,
      paymentStatus: true,
      currency: true,
      totalFinal: true,
      createdAt: true,
    },
  });

  return order;
};

export const addProductToOrder = async (
  orderId: string,
  productVariantId: string,
  quantity: number
) => {
  return await prisma.$transaction(async (tx) => {

    // 1. Find Product Variant
    const variant = await tx.productVariant.findUnique({
      where: {
        id: productVariantId,
      },
    });

    if (!variant) {
      throw new Error("Product variant not found");
    }

    // 2. Stock Check
    if (variant.stock < quantity) {
      throw new Error("Insufficient stock");
    }

    // 3. Existing Item
    const existingItem = await tx.orderItem.findFirst({
      where: {
        orderId,
        productVariantId,
      },
    });

    if (existingItem) {

      await tx.orderItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      });

    } else {

      await tx.orderItem.create({
        data: {
          orderId,
          productVariantId,
          quantity,
          price: variant.price,
        },
      });

    }

    // 4. Reduce Stock
    await tx.productVariant.update({
      where: {
        id: productVariantId,
      },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });

    // 5. Recalculate Order Total
    const items = await tx.orderItem.findMany({
      where: {
        orderId,
      },
    });

    const total = items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    // 6. Update Order
    const order = await tx.order.update({
      where: {
        id: orderId,
      },
      data: {
        totalFinal: total,
      },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        totalFinal: true,
      },
    });

    return order;

  });
};

export const getOrderDetails = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    select: {
      id: true,
      status: true,
      paymentStatus: true,
      currency: true,
      totalFinal: true,
      createdAt: true,

      user: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
        },
      },

      address: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          street: true,
          city: true,
          province: true,
          postalCode: true,
          country: true,
        },
      },

      items: {
        select: {
          id: true,
          quantity: true,
          price: true,

          productVariant: {
            select: {
              id: true,
              sku: true,
              weight: true,

              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const items = order.items.map((item) => ({
    ...item,
    lineTotal: item.price * item.quantity,
  }));

  return {
    ...order,
    items,
  };
};

export const updateOrderItemQuantity = async (
  orderItemId: string,
  quantity: number
) => {
  return await prisma.$transaction(async (tx) => {

    if (quantity < 1) {
      throw new Error("Quantity must be at least 1");
    }

    // Existing Order Item
    const orderItem = await tx.orderItem.findUnique({
      where: {
        id: orderItemId,
      },
    });

    if (!orderItem) {
      throw new Error("Order item not found");
    }

    // Product Variant
    const variant = await tx.productVariant.findUnique({
      where: {
        id: orderItem.productVariantId,
      },
    });

    if (!variant) {
      throw new Error("Product variant not found");
    }

    // Difference
    const difference = quantity - orderItem.quantity;

    // Increase Quantity
    if (difference > 0) {

      if (variant.stock < difference) {
        throw new Error("Insufficient stock");
      }

      await tx.productVariant.update({
        where: {
          id: variant.id,
        },
        data: {
          stock: {
            decrement: difference,
          },
        },
      });

    }

    // Decrease Quantity
    if (difference < 0) {

      await tx.productVariant.update({
        where: {
          id: variant.id,
        },
        data: {
          stock: {
            increment: Math.abs(difference),
          },
        },
      });

    }

    // Update Order Item
    await tx.orderItem.update({
      where: {
        id: orderItemId,
      },
      data: {
        quantity,
      },
    });

    // Recalculate Total
    const items = await tx.orderItem.findMany({
      where: {
        orderId: orderItem.orderId,
      },
    });

    const total = items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    const order = await tx.order.update({
      where: {
        id: orderItem.orderId,
      },
      data: {
        totalFinal: total,
      },
      select: {
        id: true,
        totalFinal: true,
        status: true,
        paymentStatus: true,
      },
    });

    return order;

  });
};

export const removeProductFromOrder = async (
  orderItemId: string
) => {
  return await prisma.$transaction(async (tx) => {

    // 1. Find Order Item
    const orderItem = await tx.orderItem.findUnique({
      where: {
        id: orderItemId,
      },
    });

    if (!orderItem) {
      throw new Error("Order item not found");
    }

    // 2. Return Stock
    await tx.productVariant.update({
      where: {
        id: orderItem.productVariantId,
      },
      data: {
        stock: {
          increment: orderItem.quantity,
        },
      },
    });

    // 3. Delete Order Item
    await tx.orderItem.delete({
      where: {
        id: orderItemId,
      },
    });

    // 4. Calculate New Order Total
    const items = await tx.orderItem.findMany({
      where: {
        orderId: orderItem.orderId,
      },
    });

    const total = items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    // 5. Update Order
    const order = await tx.order.update({
      where: {
        id: orderItem.orderId,
      },
      data: {
        totalFinal: total,
      },
      select: {
        id: true,
        totalFinal: true,
        status: true,
        paymentStatus: true,
      },
    });

    return order;

  });
};

export const confirmOrder = async (orderId: string) => {
  const order = await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status: "CONFIRMED",
    },
    select: {
      id: true,
      status: true,
      paymentStatus: true,
      totalFinal: true,
    },
  });

  return order;
};