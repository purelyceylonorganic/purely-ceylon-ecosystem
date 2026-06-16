import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// CREATE FARMER
export const createFarmer = async (req: Request, res: Response) => {
  const farmer = await prisma.farmer.create({
    data: req.body,
  });

  res.status(201).json(farmer);
};

// GET FARMERS
export const getFarmers = async (req: Request, res: Response) => {
  const farmers = await prisma.farmer.findMany();
  res.json(farmers);
};