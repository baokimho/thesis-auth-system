import jwt from "jsonwebtoken";
import { TokenPayload, TOKEN_TYPES } from "@shared/types/auth";
import { readUtf8File } from "@shared/utils/file";
import { verifyAccessToken } from "@shared/utils/token";

export class JWTVerifyService {
  private publicKey: string;

  constructor() {
    this.publicKey = readUtf8File("key/jwt_public.pub");
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

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    return verifyAccessToken(this.publicKey, token);
  }

  verifyRefreshToken(token: string): TokenPayload {
    const payload = this.verifyToken(token);

    if (payload.typ !== TOKEN_TYPES.REFRESH) {
      throw new Error("Invalid token type");
    }

    return payload;
  }
}