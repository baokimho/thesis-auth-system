import jwt from "jsonwebtoken";
import { readFileSync } from "fs";
import { join } from "path";
import { createPrivateKey, createPublicKey } from "crypto";

const privateKey = createPrivateKey(
  readFileSync(join(__dirname, "../../key/jwt_private.key"))
);

const publicKey = createPublicKey(
  readFileSync(join(__dirname, "../../key/jwt_public.pub"))
);

export class JWTService {
  generateAccessToken(payload: any): string {
    return jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "15m",
    });
  }

  verifyAccessToken(token: string): any {
    return jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    });
  }

  generateRefreshToken(payload: any): string {
    return jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "7d",
    });
  }

  verifyRefreshToken(token: string): any {
    return jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    });
  }
}