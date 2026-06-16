import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createCoupon = async (
 req: Request,
 res: Response
) => {

 try {

  const coupon = await prisma.coupon.create({
   data: req.body
  });

  res.status(201).json({
   success: true,
   coupon
  });

 } catch (error) {
  console.log("COUPON ERROR 👉", error);

  res.status(500).json({
    success: false,
    message: "Failed to create coupon",
    error: error instanceof Error ? error.message : error
  });
}

};
export const getCoupons = async (
 req: Request,
 res: Response
) => {

 const coupons = await prisma.coupon.findMany();

 res.json({
  success: true,
  coupons
 });

};

export const validateCoupon = async (
 req: Request,
 res: Response
) => {

 const { code, total } = req.body;

 const coupon = await prisma.coupon.findUnique({
  where: {
   code
  }
 });

 if (!coupon) {
  return res.status(404).json({
   success: false,
   message: "Coupon not found"
  });
 }

 if (!coupon.isActive) {
  return res.status(400).json({
   success: false,
   message: "Coupon inactive"
  });
 }

 if (new Date() > coupon.endDate) {
  return res.status(400).json({
   success: false,
   message: "Coupon expired"
  });
 }

 let discount = 0;

 if (coupon.discountType === "PERCENTAGE") {

  discount =
   (total * coupon.discountValue) / 100;

 }

 if (coupon.discountType === "FIXED") {

  discount = coupon.discountValue;

 }

 const finalAmount = total - discount;

 res.json({
  success: true,
  discount,
  finalAmount
 });

};

