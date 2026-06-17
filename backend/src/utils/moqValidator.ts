import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const validateMOQ = async (
  items: any[]
) => {

  for (const item of items) {

    const product =
      await prisma.product.findUnique({
        where: {
          id: item.productId
        }
      });

    if (!product) {

      throw new Error(
        "Product not found"
      );

    }

    if (item.quantity < product.moq) {

      throw new Error(
        `${product.name} MOQ is ${product.moq}`
      );

    }

  }

};