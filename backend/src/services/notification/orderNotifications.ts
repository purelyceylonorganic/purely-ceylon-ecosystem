import { prisma } from "../../config/prisma";

// ======================================================
// 🔔 Order / Payment / Stock அறிவிப்புகள்
// இங்குள்ள functions எப்போதும் "அமைதியாகத்" தோல்வியடையும் —
// அறிவிப்புப் பிழையால் order, payment, stock மாற்றம் ஒருபோதும் தடைபடாது.
// ======================================================

// இந்த எண்ணிக்கை அல்லது அதற்குக் கீழே stock குறைந்தால் எச்சரிக்கை
export const LOW_STOCK_THRESHOLD = 10;

type StaffRole = "SUPER_ADMIN" | "ADMIN" | "FINANCE" | "WAREHOUSE_MANAGER";

const shortId = (id: string) => id.slice(0, 8).toUpperCase();

const formatAmount = (amount: number, currency: string) =>
  `${currency === "USD" ? "USD" : "LKR"} ${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// 📣 குறிப்பிட்ட பணியாளர் பாத்திரங்களுக்கு அறிவிப்பு
export async function notifyStaff(
  title: string,
  message: string,
  type: string,
  roles: StaffRole[] = ["SUPER_ADMIN", "ADMIN", "FINANCE"]
) {
  try {
    const staff = await prisma.user.findMany({
      where: { role: { in: roles } },
      select: { id: true },
    });

    if (staff.length === 0) return;

    await prisma.notification.createMany({
      data: staff.map((user) => ({ userId: user.id, title, message, type })),
    });
  } catch (error) {
    console.error("Staff notification failed:", error);
  }
}

// 📦 வாடிக்கையாளருக்கு அறிவிப்பு
export async function notifyCustomer(
  userId: string,
  title: string,
  message: string,
  type = "ORDER"
) {
  try {
    await prisma.notification.create({
      data: { userId, title, message, type },
    });
  } catch (error) {
    console.error("Customer notification failed:", error);
  }
}

// 🛎️ புதிய order வந்தால் Admin / Finance அனைவருக்கும்
export async function notifyAdminsNewOrder(
  order: { id: string; totalFinal: number; currency: string; paymentMethod?: string | null },
  customerName: string
) {
  const payment = order.paymentMethod ? ` • ${order.paymentMethod}` : "";

  await notifyStaff(
    "New order received",
    `Order #${shortId(order.id)} from ${customerName} — ${formatAmount(
      order.totalFinal,
      order.currency
    )}${payment}`,
    "ORDER"
  );
}

// 💰 Payment கிடைத்தால் (Admin + வாடிக்கையாளர்)
export async function notifyPaymentReceived(p: {
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  fullyPaid: boolean;
  balance: number;
}) {
  const received = formatAmount(p.amount, p.currency);
  const balance = formatAmount(p.balance, p.currency);

  await notifyStaff(
    "Payment received",
    `Order #${shortId(p.orderId)} — ${received} received${
      p.fullyPaid ? " (paid in full)" : ` • balance ${balance}`
    }`,
    "PAYMENT"
  );

  await notifyCustomer(
    p.userId,
    "Payment received",
    `We received ${received} for order #${shortId(p.orderId)}.${
      p.fullyPaid ? " Thank you!" : ` Remaining balance: ${balance}.`
    }`,
    "PAYMENT"
  );
}

// ❌ Order ரத்தானால் Finance-க்கு (பணம் வாங்கியிருந்தால் refund நினைவூட்டல்)
export async function notifyOrderCancelled(orderId: string, paymentAlreadyReceived: boolean) {
  await notifyStaff(
    "Order cancelled",
    `Order #${shortId(orderId)} was cancelled and its stock was returned.${
      paymentAlreadyReceived
        ? " ⚠️ A payment had already been received — please check if a refund is needed."
        : ""
    }`,
    "ORDER"
  );
}

// 📉 Stock குறைந்தால் / தீர்ந்தால் — எல்லை கடக்கும்போது மட்டும் (தொடர் spam இல்லை)
export async function notifyLowStock(
  items: { productVariantId: string; quantity: number }[]
) {
  try {
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: items.map((item) => item.productVariantId) } },
      select: {
        id: true,
        sku: true,
        weight: true,
        stock: true,
        product: { select: { name: true } },
      },
    });

    for (const item of items) {
      const variant = variants.find((v) => v.id === item.productVariantId);
      if (!variant) continue;

      const before = variant.stock + item.quantity;
      const label = `${variant.product.name} (${variant.weight}) • ${variant.sku}`;

      if (before > 0 && variant.stock <= 0) {
        await notifyStaff(
          "Out of stock",
          `${label} is now out of stock.`,
          "STOCK",
          ["SUPER_ADMIN", "ADMIN", "WAREHOUSE_MANAGER"]
        );
      } else if (before > LOW_STOCK_THRESHOLD && variant.stock <= LOW_STOCK_THRESHOLD) {
        await notifyStaff(
          "Low stock",
          `${label} — only ${variant.stock} left.`,
          "STOCK",
          ["SUPER_ADMIN", "ADMIN", "WAREHOUSE_MANAGER"]
        );
      }
    }
  } catch (error) {
    console.error("Low stock notification failed:", error);
  }
}

export const orderShortId = shortId;