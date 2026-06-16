import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getCurrencies = async (
 req:any,
 res:any
) => {

 const rates = await prisma.currencyRate.findMany();

 res.json(rates);

};