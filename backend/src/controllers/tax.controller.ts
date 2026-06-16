import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create Tax
export const createTaxRate = async (
 req: Request,
 res: Response
) => {

 try {

   const { country, taxName, rate } = req.body;

   const tax = await prisma.taxRate.create({
     data: {
       country,
       taxName,
       rate
     }
   });

   res.status(201).json({
     success: true,
     tax
   });

 } catch {

   res.status(500).json({
     success: false
   });

 }

};

// Get All Taxes
export const getTaxRates = async (
 req: Request,
 res: Response
) => {

 try {

   const taxes = await prisma.taxRate.findMany();

   res.json({
     success: true,
     taxes
   });

 } catch {

   res.status(500).json({
     success: false
   });

 }

};

// Get Country Tax
export const getCountryTax = async (
 req: Request,
 res: Response
) => {

 try {

   const { country } = req.params;

   const tax = await prisma.taxRate.findFirst({
     where: {
       country
     }
   });

   res.json({
     success: true,
     tax
   });

 } catch {

   res.status(500).json({
     success: false
   });

 }

};

// Calculate Tax
export const calculateTax = async (
 req: Request,
 res: Response
) => {

 try {

   const { country, amount } = req.body;

   const tax = await prisma.taxRate.findFirst({
     where: {
       country
     }
   });

   if (!tax) {

     return res.status(404).json({
       success: false,
       message: "Tax Rate Not Found"
     });

   }

   const taxAmount =
     (amount * tax.rate) / 100;

   const total =
     amount + taxAmount;

   res.json({
     success: true,
     subtotal: amount,
     taxRate: tax.rate,
     taxAmount,
     total
   });

 } catch {

   res.status(500).json({
     success: false
   });

 }

};