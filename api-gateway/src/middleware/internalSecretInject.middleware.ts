import { NextFunction, Request, Response } from "express";

const INTERNAL_SECRET_HEADER = "x-internal-secret";
const INTERNAL_SECRET = process.env.INTERNAL_SECRET;

if (!INTERNAL_SECRET) {
  throw new Error("INTERNAL_SECRET is required");
}

export function injectInternalSecret(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  // Never trust client-provided value: strip and overwrite with trusted secret.
  delete req.headers[INTERNAL_SECRET_HEADER];
  req.headers[INTERNAL_SECRET_HEADER] = INTERNAL_SECRET;
  next();
}
