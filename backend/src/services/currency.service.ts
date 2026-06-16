import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const updateCurrencyRates = async () => {

 const response = await axios.get(
   "https://open.er-api.com/v6/latest/USD"
 );

 const rates = response.data.rates;

 for (const code in rates) {

   await prisma.currencyRate.upsert({
      where: { code },

      update: {
        rate: rates[code]
      },

      create: {
        code,
        rate: rates[code]
      }
   });

 }

};