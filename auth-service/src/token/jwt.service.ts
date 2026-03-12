import jwt from "jsonwebtoken";
import { readFileSync } from "fs";
import { join } from "path";
import { createPrivateKey, createPublicKey } from "crypto";
import { AuthPayload, TokenPayload, TokenService } from "@shared/types/auth";

const privateKey = createPrivateKey(
  readFileSync(join(__dirname, "../../key/jwt_private.key"))
);

const publicKey = createPublicKey(
  readFileSync(join(__dirname, "../../key/jwt_public.pub"))
);

export class JWTService implements TokenService{
  async generateAccessToken(payload: AuthPayload): Promise<string> {
    return jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "15m",
    });
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    return jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    }) as TokenPayload;
  }

  async generateRefreshToken(payload: AuthPayload): Promise<string> {
    return jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "7d",
    });
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    return jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    }) as TokenPayload;
  }
}