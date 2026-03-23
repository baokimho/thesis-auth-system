import { NextFunction, Request, Response } from "express";

const INTERNAL_SECRET_HEADER = "x-internal-secret";
const INTERNAL_SECRET = process.env.INTERNAL_SECRET;

if (!INTERNAL_SECRET) {
  throw new Error("INTERNAL_SECRET is required");
}

export function validateInternalSecret(
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  const providedSecret = req.header(INTERNAL_SECRET_HEADER);

  if (!providedSecret || providedSecret !== INTERNAL_SECRET) {
    return res.status(403).json({
      error: "Forbidden",
    });
  }

  next();
}
