import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate = (schema: ZodSchema) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    
console.log("✅ Validation Middleware Running");

    const result =
      schema.safeParse(req.body);

    if (!result.success) {

      return res.status(400).json({

        success: false,

        message: "Validation Failed",

        errors:
          result.error.flatten(),

      });

    }

    req.body = result.data;

    next();

  };
};