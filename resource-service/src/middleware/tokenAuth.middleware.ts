import { Request, Response, NextFunction } from "express";
import { TokenPayload } from "@shared/types/auth";
import { extractBearerToken, verifyAccessTokenForResource } from "../helpers/token.helper";

/**
 * Token authentication middleware
 * Extracts Bearer token from Authorization header and verifies it
 * Sets res.locals.user with decoded token payload on success
 * Returns 401 if token is missing, invalid, or expired
 */
export function tokenAuthMiddleware(
  jwtPublicKey: string,
  pasetoPublicKey: string
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = extractBearerToken(req.headers.authorization);

      if (!token) {
        return res.status(401).json({
          error: "Missing or invalid Authorization header",
        });
      }

      const payload = await verifyAccessTokenForResource(
        token,
        jwtPublicKey,
        pasetoPublicKey
      );
      res.locals.user = payload;
      next();
    } catch {
      return res.status(401).json({
        error: "Invalid or expired token",
      });
    }
  };
}
