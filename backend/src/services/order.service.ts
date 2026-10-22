import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import {
  calculateOrderCharges,
  loadLkrPerUsd,
  pickCurrencyForCountry,
  type Currency,
} from "./checkoutPricing.service";

type Tx = Prisma.TransactionClient;

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

// ======================================================
// 🧮 Order-ன் மொத்தத்தை மீண்டும் கணக்கிடுதல்
// Items-ன் விலை (order currency-ல்) + shipping + tax = மொத்தம்
// ======================================================
async function recalculateOrderTotals(tx: Tx, orderId: string) {
  const order = await tx.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: true, address: true },
  });

  const subtotal = round2(
    order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  // Items இல்லையென்றால் எல்லாம் 0
  if (order.items.length === 0) {
    return tx.order.update({
      where: { id: orderId },
      data: {
        subtotal: 0,
        shippingCost: 0,
        taxAmount: 0,
        totalFinal: 0,
        totalUSD: 0,
        balance: 0,
      },
      select: { id: true, status: true, paymentStatus: true, totalFinal: true },
    });
  }

  const charges = await calculateOrderCharges({
    country: order.address?.country ?? "Sri Lanka",
    province: order.address?.province,
    currency: order.currency as Currency,
    subtotal,
    discountAmount: order.discountAmount ?? 0,
  });

  return tx.order.update({
    where: { id: orderId },
    data: {
      subtotal,
      exchangeRate: charges.exchangeRate,
      shippingCost: charges.shippingCost,
      taxAmount: charges.taxAmount,
      totalFinal: charges.totalFinal,
      totalUSD: charges.totalUSD,
      balance: Math.max(round2(charges.totalFinal - (order.paidAmount ?? 0)), 0),
    },
    select: { id: true, status: true, paymentStatus: true, totalFinal: true },
  });
}

// Draft order-ஐ edit செய்யலாமா? (PENDING மட்டும்)
function assertEditable(status: string) {
  if (status !== "PENDING") {
    throw new Error("Only PENDING orders can be edited");
  }
}

// ======================================================
// 🆕 Admin order உருவாக்கம்
// Currency: கொடுத்தால் அது; இல்லையென்றால் முகவரியின் நாட்டைப் பொறுத்து (இலங்கை → LKR)
// ======================================================
export const createAdminOrder = async (
  customerId: string,
  addressId: string,
  currency?: string
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

  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId: customerId,
    },
  });

  if (!address) {
    throw new Error("Address not found");
  }

  const requested = String(currency || "").toUpperCase();
  const orderCurrency: Currency =
    requested === "LKR" || requested === "USD"
      ? requested
      : pickCurrencyForCountry(address.country);

  const lkrPerUsd = await loadLkrPerUsd();

  const order = await prisma.order.create({
    data: {
      userId: customerId,
      addressId,
      currency: orderCurrency,
      exchangeRate: orderCurrency === "LKR" ? lkrPerUsd : 1,
      totalUSD: 0,
      totalFinal: 0,
      subtotal: 0,
      balance: 0,
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

// ======================================================
// ➕ Product சேர்த்தல் — Order-ன் currency-க்கு ஏற்ற விலை
// ======================================================
export const addProductToOrder = async (
  orderId: string,
  productVariantId: string,
  quantity: number
) => {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, currency: true },
    });

    if (!order) {
      throw new Error("Order not found");
    }
    assertEditable(order.status);

    const variant = await tx.productVariant.findUnique({
      where: { id: productVariantId },
      include: { product: { select: { name: true, isActive: true, deletedAt: true } } },
    });

    if (!variant) {
      throw new Error("Product variant not found");
    }
    if (!variant.product.isActive || variant.product.deletedAt) {
      throw new Error(`${variant.product.name} is no longer available`);
    }

    // ✅ முன்பு எப்போதும் USD விலை (variant.price) எடுக்கப்பட்டது — இப்போது order currency-க்கு ஏற்ப
    const unitPrice = order.currency === "LKR" ? variant.priceLKR : variant.price;

    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new Error(
        `${order.currency} price is not set for ${variant.product.name} (${variant.weight}). Set it in Edit Product first.`
      );
    }

    // Stock-ஐ பாதுகாப்பாக ஒதுக்குதல்
    const reserved = await tx.productVariant.updateMany({
      where: { id: productVariantId, stock: { gte: quantity } },
      data: { stock: { decrement: quantity } },
    });

    if (reserved.count === 0) {
      throw new Error("Insufficient stock");
    }

    const existingItem = await tx.orderItem.findFirst({
      where: { orderId, productVariantId },
    });

    if (existingItem) {
      await tx.orderItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await tx.orderItem.create({
        data: {
          orderId,
          productVariantId,
          quantity,
          price: unitPrice,
          unitPrice,
          productName: variant.product.name,
          variantLabel: variant.weight,
          sku: variant.sku,
          costPriceLKR: variant.costPrice ?? 0,
          currency: order.currency,
        },
      });
    }

    return recalculateOrderTotals(tx, orderId);
  }, { maxWait: 10_000, timeout: 15_000 });
};

// ======================================================
// 🔍 Order விவரம் (Order Builder / Admin Order Details)
// ======================================================
export const getOrderDetails = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    select: {
      id: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
      currency: true,
      totalFinal: true,
      subtotal: true,
      discountAmount: true,
      shippingCost: true,
      taxAmount: true,
      totalUSD: true,
      exchangeRate: true,
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
          productName: true,
          variantLabel: true,
          sku: true,

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
    lineTotal: round2(item.price * item.quantity),
  }));

  return {
    ...order,
    items,
  };
};

// ======================================================
// 🔢 அளவு மாற்றம்
// ======================================================
export const updateOrderItemQuantity = async (
  orderItemId: string,
  quantity: number
) => {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  return await prisma.$transaction(async (tx) => {
    const orderItem = await tx.orderItem.findUnique({
      where: { id: orderItemId },
      include: { order: { select: { id: true, status: true } } },
    });

    if (!orderItem) {
      throw new Error("Order item not found");
    }
    assertEditable(orderItem.order.status);

    const difference = quantity - orderItem.quantity;

    if (difference > 0) {
      const reserved = await tx.productVariant.updateMany({
        where: { id: orderItem.productVariantId, stock: { gte: difference } },
        data: { stock: { decrement: difference } },
      });

      if (reserved.count === 0) {
        throw new Error("Insufficient stock");
      }
    } else if (difference < 0) {
      await tx.productVariant.update({
        where: { id: orderItem.productVariantId },
        data: { stock: { increment: Math.abs(difference) } },
      });
    }

    await tx.orderItem.update({
      where: { id: orderItemId },
      data: { quantity },
    });

    return recalculateOrderTotals(tx, orderItem.orderId);
  }, { maxWait: 10_000, timeout: 15_000 });
};

// ======================================================
// ➖ Product நீக்குதல்
// ======================================================
export const removeProductFromOrder = async (orderItemId: string) => {
  return await prisma.$transaction(async (tx) => {
    const orderItem = await tx.orderItem.findUnique({
      where: { id: orderItemId },
      include: { order: { select: { id: true, status: true } } },
    });

    if (!orderItem) {
      throw new Error("Order item not found");
    }
    assertEditable(orderItem.order.status);

    await tx.productVariant.update({
      where: { id: orderItem.productVariantId },
      data: { stock: { increment: orderItem.quantity } },
    });

    await tx.orderItem.delete({ where: { id: orderItemId } });

    return recalculateOrderTotals(tx, orderItem.orderId);
  }, { maxWait: 10_000, timeout: 15_000 });
};

// ======================================================
// ✅ Order உறுதி
// ======================================================
export const confirmOrder = async (orderId: string) => {
  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, _count: { select: { items: true } } },
  });

  if (!existing) {
    throw new Error("Order not found");
  }
  if (existing._count.items === 0) {
    throw new Error("Add at least one product before confirming the order");
  }
  if (existing.status !== "PENDING") {
    throw new Error("Only PENDING orders can be confirmed");
  }

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