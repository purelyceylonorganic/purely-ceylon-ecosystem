import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// CREATE BATCH
export const createBatch = async (req: Request, res: Response) => {
  const batch = await prisma.batch.create({
    data: req.body,
  });

  res.status(201).json(batch);
};

// GET BATCHES
export const getBatches = async (req: Request, res: Response) => {
  const batches = await prisma.batch.findMany({
    include: {
      farm: true,
    },
  });

  res.json(batches);
};