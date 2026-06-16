import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// CREATE TRACEABILITY
export const createTraceability = async (req: Request, res: Response) => {
  const record = await prisma.traceabilityRecord.create({
    data: req.body,
  });

  res.status(201).json(record);
};

// GET TRACEABILITY
export const getTraceability = async (req: Request, res: Response) => {
  const records = await prisma.traceabilityRecord.findMany({
    include: {
      batch: true,
    },
  });

  res.json(records);
};