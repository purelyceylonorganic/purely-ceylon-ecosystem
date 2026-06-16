import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// CREATE FARM
export const createFarm = async (req: Request, res: Response) => {
  const farm = await prisma.farm.create({
    data: req.body,
  });

  res.status(201).json(farm);
};

// GET FARMS
export const getFarms = async (req: Request, res: Response) => {
  const farms = await prisma.farm.findMany({
    include: {
      farmer: true,
    },
  });

  res.json(farms);
};