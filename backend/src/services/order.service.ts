import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import {
  calculateOrderCharges,
  loadLkrPerUsd,
  pickCurrencyForCountry,
  type Currency,
} from "./checkoutPricing.service";
import { getShippingOptions } from "./ShippingRates.service";
import { notifyCustomer, orderShortId } from "./notification/orderNotifications";

type Tx = Prisma.TransactionClient;

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

// ======================================================
// 🧮 Order-ன் மொத்தத்தை மீண்டும் கணக்கிடுதல்
// Items-ன் விலை (order currency-ல்) + shipping + tax = மொத்தம்
// ======================================================
async function recalculateOrderTotals(tx: Tx, orderId: string) {
  const order = await tx.order.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      items: { include: { productVariant: { select: { weightGrams: true } } } },
      address: true,
    },
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
        shippingDiscount: 0,
        shippingBaseCost: 0,
        shippingWeightGrams: 0,
        taxAmount: 0,
        totalFinal: 0,
        totalUSD: 0,
        balance: 0,
      },
      select: { id: true, status: true, paymentStatus: true, totalFinal: true },
    });
  }

  const totalGrams = order.items.reduce(
    (sum, item) => sum + (item.productVariant?.weightGrams ?? 0) * item.quantity,
    0
  );

  // Rate Table + தேர்ந்த முறை + Admin override எல்லாம் இங்கே ஒன்றாகப் பொருந்தும்
  const charges = await calculateOrderCharges({
    country: order.address?.country ?? "Sri Lanka",
    province: order.address?.province,
    currency: order.currency as Currency,
    subtotal,
    discountAmount: order.discountAmount ?? 0,
    totalGrams,
    shippingMethodCode: order.shippingMethodCode,
    overrideMode: order.shippingOverrideMode,
    overrideValue: order.shippingOverrideValue,
  });

  return tx.order.update({
    where: { id: orderId },
    data: {
      subtotal,
      exchangeRate: charges.exchangeRate,
      shippingCost: charges.shippingCost,
      shippingDiscount: charges.shippingDiscount,
      shippingBaseCost: charges.shippingBaseCost,
      shippingMethodCode: charges.shippingMethodCode,
      shippingMethodName: charges.shippingMethodName,
      shippingCarrier: charges.shippingCarrier,
      shippingMinDays: charges.shippingMinDays,
      shippingMaxDays: charges.shippingMaxDays,
      shippingWeightGrams: totalGrams,
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
  });
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
      shippingDiscount: true,
      shippingMethodName: true,
      shippingCarrier: true,
      shippingMinDays: true,
      shippingMaxDays: true,
      shippingStatus: true,
      trackingId: true,
      trackingCarrier: true,
      trackingUrl: true,
      shippedAt: true,
      deliveredAt: true,
      shippingEvents: {
        orderBy: { createdAt: "asc" },
        select: { id: true, status: true, location: true, note: true, createdAt: true },
      },
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
  });
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
  });
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

// ======================================================
// 🚚 SHIPPING கட்டுப்பாடு (Admin)
// ======================================================
const SHIPPING_STATUSES = ["PENDING", "PACKED", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"];
const OVERRIDE_MODES = ["MANUAL", "FREE", "DISCOUNT"];

// கட்டணம் / முறையை மாற்றக்கூடிய நிலையா? (அனுப்பும் முன், பணம் வாங்கும் முன் மட்டும்)
function assertShippingEditable(order: { status: string; paymentStatus: string }) {
  if (["SHIPPED", "DELIVERED", "CANCELLED"].includes(order.status)) {
    throw new Error("Shipping cannot be changed after the order is shipped, delivered or cancelled");
  }
  if (order.paymentStatus !== "UNPAID") {
    throw new Error(
      "A payment is already recorded for this order. Shipping charges can only be changed before payment."
    );
  }
}

// Carrier-க்கு ஏற்ற Tracking இணைப்பு (Admin கையால் மாற்றலாம்)
function buildTrackingUrl(carrier: string | null | undefined, trackingNumber: string) {
  const number = encodeURIComponent(trackingNumber);

  if ((carrier || "").toLowerCase().includes("dhl")) {
    return `https://www.dhl.com/global-en/home/tracking/tracking-express.html?submit=1&tracking-id=${number}`;
  }

  // Sri Lanka Post உட்பட மற்றவை: பொது tracking தளம்
  return `https://t.17track.net/en#nums=${number}`;
}

// ======================================================
// 📋 Order-ன் shipping விவரம் + கிடைக்கும் முறைகள் + நிகழ்வுகள்
// ======================================================
export const getOrderShippingInfo = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { productVariant: { select: { weightGrams: true } } } },
      address: true,
      shippingEvents: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const totalGrams = order.items.reduce(
    (sum, item) => sum + (item.productVariant?.weightGrams ?? 0) * item.quantity,
    0
  );

  const itemsSubtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotal = order.subtotal > 0 ? order.subtotal : itemsSubtotal;

  let options: Awaited<ReturnType<typeof getShippingOptions>>["options"] = [];

  try {
    const result = await getShippingOptions({
      country: order.address?.country ?? "Sri Lanka",
      currency: order.currency as Currency,
      subtotal: Math.max(subtotal - (order.discountAmount ?? 0), 0),
      totalGrams,
    });
    options = result.options;
  } catch {
    options = [];
  }

  let canEdit = true;
  let editBlockedReason: string | null = null;

  try {
    assertShippingEditable(order);
  } catch (error: any) {
    canEdit = false;
    editBlockedReason = error.message;
  }

  return {
    order: {
      id: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      currency: order.currency,
      subtotal,
      totalFinal: order.totalFinal,
      shippingCost: order.shippingCost,
      shippingBaseCost:
        order.shippingBaseCost != null && order.shippingBaseCost > 0
          ? order.shippingBaseCost
          : order.shippingCost + order.shippingDiscount,
      shippingDiscount: order.shippingDiscount,
      shippingMethodCode: order.shippingMethodCode,
      shippingMethodName: order.shippingMethodName,
      shippingCarrier: order.shippingCarrier,
      shippingMinDays: order.shippingMinDays,
      shippingMaxDays: order.shippingMaxDays,
      shippingWeightGrams: order.shippingWeightGrams > 0 ? order.shippingWeightGrams : totalGrams,
      shippingOverrideMode: order.shippingOverrideMode,
      shippingOverrideValue: order.shippingOverrideValue,
      shippingOverrideReason: order.shippingOverrideReason,
      shippingStatus: order.shippingStatus,
      trackingId: order.trackingId,
      trackingCarrier: order.trackingCarrier,
      trackingUrl: order.trackingUrl,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      country: order.address?.country ?? null,
    },
    options,
    events: order.shippingEvents,
    canEdit,
    editBlockedReason,
  };
};

// ======================================================
// 📦 Shipping முறையை மாற்றுதல் (Draft / அனுப்பாத order)
// ======================================================
export const setOrderShippingMethod = async (orderId: string, methodCode: string) => {
  const info = await getOrderShippingInfo(orderId);

  assertShippingEditable(info.order);

  if (!info.options.some((option) => option.methodCode === methodCode)) {
    throw new Error("This shipping method is not available for the delivery address and weight");
  }

  return prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        shippingMethodCode: methodCode,
        // முறையை மாற்றினால் பழைய கையால் மாற்றிய கட்டணம் நீங்கும்
        shippingOverrideMode: null,
        shippingOverrideValue: null,
        shippingOverrideReason: null,
      },
    });

    return recalculateOrderTotals(tx, orderId);
  });
};

// ======================================================
// 💲 Shipping கட்டணத்தைக் கையால் மாற்றுதல்: இலவசம் / தள்ளுபடி / கையால் தொகை / மீட்டமை
// ======================================================
export const setOrderShippingOverride = async (
  orderId: string,
  input: { mode: string | null; value?: number | null; reason?: string | null }
) => {
  const info = await getOrderShippingInfo(orderId);

  assertShippingEditable(info.order);

  const mode = input.mode && input.mode !== "RESET" ? input.mode : null;

  if (mode !== null && !OVERRIDE_MODES.includes(mode)) {
    throw new Error("Invalid shipping override type");
  }

  const value = input.value === undefined || input.value === null ? null : Number(input.value);

  if (mode === "MANUAL" && (value === null || !Number.isFinite(value) || value < 0)) {
    throw new Error("Enter the shipping cost (0 or more)");
  }
  if (mode === "DISCOUNT" && (value === null || !Number.isFinite(value) || value <= 0)) {
    throw new Error("Enter the discount amount (more than 0)");
  }

  const reason = (input.reason || "").trim();
  if (mode !== null && reason.length < 3) {
    throw new Error("Please give a short reason (it is saved for your records)");
  }

  return prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        shippingOverrideMode: mode,
        shippingOverrideValue: mode === "MANUAL" || mode === "DISCOUNT" ? value : null,
        shippingOverrideReason: mode === null ? null : reason,
      },
    });

    return recalculateOrderTotals(tx, orderId);
  });
};

// ======================================================
// 🚛 Shipping நிலை + Tracking எண் புதுப்பிப்பு (நிகழ்வுப் பதிவுடன்)
// ======================================================
export const updateOrderShipping = async (
  orderId: string,
  input: {
    shippingStatus?: string;
    trackingNumber?: string | null;
    trackingCarrier?: string | null;
    trackingUrl?: string | null;
    location?: string | null;
    note?: string | null;
  },
  actorId?: string
) => {
  if (input.shippingStatus !== undefined && !SHIPPING_STATUSES.includes(input.shippingStatus)) {
    throw new Error("Invalid shipping status");
  }

  const existing = await prisma.order.findUnique({ where: { id: orderId } });

  if (!existing) {
    throw new Error("Order not found");
  }
  if (existing.status === "CANCELLED") {
    throw new Error("A cancelled order cannot be shipped");
  }

  const newStatus = input.shippingStatus ?? existing.shippingStatus;
  const statusChanged = newStatus !== existing.shippingStatus;

  const trackingNumber =
    input.trackingNumber !== undefined ? input.trackingNumber?.trim() || null : existing.trackingId;
  const trackingChanged = trackingNumber !== existing.trackingId;

  const carrier =
    input.trackingCarrier !== undefined
      ? input.trackingCarrier?.trim() || null
      : existing.trackingCarrier ?? existing.shippingCarrier;

  // Tracking இணைப்பு: Admin கொடுத்தால் அது; இல்லையென்றால் carrier-க்கு ஏற்ப தானாக
  let trackingUrl: string | null =
    input.trackingUrl !== undefined ? input.trackingUrl?.trim() || null : existing.trackingUrl;

  if (trackingNumber && (!trackingUrl || (trackingChanged && input.trackingUrl === undefined))) {
    trackingUrl = buildTrackingUrl(carrier, trackingNumber);
  }
  if (!trackingNumber) {
    trackingUrl = null;
  }

  // Tracking உள்ள முறைக்கு, அனுப்பியதாகக் குறிக்கும் முன் எண் கட்டாயம்
  if (["SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(newStatus) && !trackingNumber) {
    const method = existing.shippingMethodCode
      ? await prisma.shippingMethod.findUnique({ where: { code: existing.shippingMethodCode } })
      : null;

    if (method?.hasTracking) {
      throw new Error("Add the tracking number before marking this tracked shipment as shipped");
    }
  }

  const now = new Date();
  const note = input.note?.trim() || null;
  const location = input.location?.trim() || null;

  const updated = await prisma.$transaction(async (tx) => {
    // Shipping நிலைக்கு ஏற்ப Order நிலையை முன்னோக்கி மட்டும் ஒத்திசைக்கிறோம்
    let orderStatus: string | undefined;

    if (newStatus === "DELIVERED") {
      orderStatus = "DELIVERED";
    } else if (
      ["SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(newStatus) &&
      ["PENDING", "CONFIRMED", "PROCESSING"].includes(existing.status)
    ) {
      orderStatus = "SHIPPED";
    }

    const order = await tx.order.update({
      where: { id: orderId },
      data: {
        shippingStatus: newStatus as any,
        trackingId: trackingNumber,
        trackingCarrier: carrier,
        trackingUrl,
        ...(newStatus !== "PENDING" && newStatus !== "PACKED" && !existing.shippedAt && { shippedAt: now }),
        ...(newStatus === "DELIVERED" && { deliveredAt: now }),
        ...(orderStatus && { status: orderStatus as any }),
      },
    });

    if (statusChanged || trackingChanged || note) {
      await tx.shippingEvent.create({
        data: {
          orderId,
          status: newStatus,
          location,
          note:
            note ||
            (trackingChanged && trackingNumber
              ? `Tracking number added: ${trackingNumber}${carrier ? ` (${carrier})` : ""}`
              : null),
          createdBy: actorId ?? null,
        },
      });
    }

    return order;
  });

  // 🔔 வாடிக்கையாளருக்கு அறிவிப்பு (தோல்வியடைந்தாலும் புதுப்பிப்பு பாதிக்கப்படாது)
  if (statusChanged || trackingChanged) {
    const label = newStatus.replace(/_/g, " ").toLowerCase();
    const trackingText = trackingNumber
      ? ` Tracking: ${trackingNumber}${carrier ? ` (${carrier})` : ""}.`
      : "";

    void notifyCustomer(
      updated.userId,
      statusChanged ? "Shipping update" : "Tracking number added",
      `Order #${orderShortId(updated.id)}: ${statusChanged ? label : "tracking details updated"}.${trackingText}`
    );
  }

  return updated;
};