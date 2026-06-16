import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// CREATE CERTIFICATE
export const createCertificate = async (req: Request, res: Response) => {
  const certificate = await prisma.certificate.create({
    data: req.body,
  });

  res.status(201).json(certificate);
};

// GET CERTIFICATES
export const getCertificates = async (req: Request, res: Response) => {
  const certificates = await prisma.certificate.findMany({
    include: {
      batch: true,
    },
  });

  res.json(certificates);
};