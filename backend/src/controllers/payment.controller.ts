import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { ROLES } from "../constants/roles";


// 💳 CREATE PAYMENT (Unified & Cleaned Controller)
export const createPayment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { orderId, amount, gateway, paymentMethod } = req.body;

    const paidAmount = Number(amount);

    if (!orderId || !Number.isFinite(paidAmount) || paidAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid orderId or payment amount",
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        totalFinal: true,
        paidAmount: true,
        paymentStatus: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const isPrivilegedUser =
      req.user.role === ROLES.ADMIN ||
      req.user.role === ROLES.SUPER_ADMIN ||
      req.user.role === ROLES.FINANCE;

    if (!isPrivilegedUser && order.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const selectedGateway = (
      gateway || "CASH"
    ).toUpperCase();

    const selectedMethod = (
      paymentMethod || selectedGateway
    ).toUpperCase();

    const result =
      await PaymentService.processManualPayment(
        orderId,
        paidAmount,
        selectedGateway,
        selectedMethod,
        req.user.id,
        req.user.email,
        req.ip,
        req.headers["user-agent"]
      );

    return res.status(200).json({
      success: true,
      message: "Payment successfully processed",
      data: {
        orderId: result.updatedOrder.id,
        transactionId: result.payment.transactionId,
        amountPaid: result.payment.amount,
        totalFinal: result.updatedOrder.totalFinal,
        paidAmount: result.updatedOrder.paidAmount,
        balance: result.updatedOrder.balance,
        paymentStatus: result.updatedOrder.paymentStatus,
        paymentMethod: result.payment.paymentMethod,
        gateway: result.payment.gateway,
      },
    });
  } catch (error: any) {
    console.error("Payment Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Payment failed",
    });
  }
};

export const refundPayment = async (
  req: Request,
  res: Response
) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;
    const user = (req as any).user;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid refund amount",
      });
    }

    if (!reason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Refund reason is required",
      });
    }

    const result = await PaymentService.refundPayment(
      paymentId,
      Number(amount),
      reason,
      user?.userId || user?.id
    );

    return res.json({
      success: true,
      message: "Refund completed successfully",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// 📜 GET PAYMENT HISTORY
export const getOrderPayments = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const isPrivilegedUser =
      req.user.role === ROLES.ADMIN ||
      req.user.role === ROLES.SUPER_ADMIN ||
      req.user.role === ROLES.FINANCE;

    if (!isPrivilegedUser && order.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const payments =
      await PaymentService.getPaymentHistory(orderId);

    return res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error: any) {
    console.error("Payment history error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load payment history",
    });
  }
};
// ==========================================
// 🔄 REVERSE PAYMENT
// ==========================================

export const reversePayment = async (
  req: Request,
  res: Response
) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    const user = (req as any).user;

    if (!reason || reason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Reverse reason is required.",
      });
    }

    const result = await PaymentService.reversePayment(
      paymentId,
      reason,
      user?.userId
    );

    return res.status(200).json({
      success: true,
      message: "Payment reversed successfully.",
      data: result,
    });

  } catch (error: any) {

    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};

export const voidPayment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!reason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Void reason is required",
      });
    }

    const payment = await PaymentService.voidPayment(
      paymentId,
      reason,
      req.user.id
    );

    return res.json({
      success: true,
      message: "Payment voided successfully",
      data: payment,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};