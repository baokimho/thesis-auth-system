import jwt from "jsonwebtoken";
import fs from "fs";
import { TokenPayload, TOKEN_TYPES } from "@shared/types/auth";

export class JWTVerifyService {
  private publicKey: string;

  constructor() {
    this.publicKey = fs.readFileSync("key/jwt_public.pub", "utf8");
  }

  private verifyToken(token: string): TokenPayload {
    const payload = jwt.verify(token, this.publicKey, {
      algorithms: ["RS256"],
    }) as TokenPayload;

    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid token payload");
    }

    return payload;
  }

  verifyAccessToken(token: string): TokenPayload {
    const payload = this.verifyToken(token);

    if (payload.typ !== TOKEN_TYPES.ACCESS) {
      throw new Error("Invalid token type");
    }

    return payload;
  }

  verifyRefreshToken(token: string): TokenPayload {
    const payload = this.verifyToken(token);

    if (payload.typ !== TOKEN_TYPES.REFRESH) {
      throw new Error("Invalid token type");
    }

    return payload;
  }
}