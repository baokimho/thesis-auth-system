import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const privateKey = fs.readFileSync(
  path.join(__dirname, "../key/private.key"),
  "utf8"
);

const publicKey = fs.readFileSync(
  path.join(__dirname, "../key/public.key"),
  "utf8"
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