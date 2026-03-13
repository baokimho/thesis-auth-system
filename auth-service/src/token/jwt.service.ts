import jwt from "jsonwebtoken";
import { join } from "path";
import { createPrivateKey, createPublicKey } from "crypto";
import { AuthPayload, TokenPayload, TokenService, TOKEN_TYPES } from "@shared/types/auth";
import { readUtf8File } from "@shared/utils/file";

let privateKey: ReturnType<typeof createPrivateKey>;
let publicKey: ReturnType<typeof createPublicKey>;

try {
  privateKey = createPrivateKey(
    readUtf8File(join(__dirname, "../../key/jwt_private.key"))
  );
  publicKey = createPublicKey(
    readUtf8File(join(__dirname, "../../key/jwt_public.pub"))
  );
} catch (err) {
  console.error("[JWTService] Failed to load keys:", err);
  process.exit(1);
}

export class JWTService implements TokenService {
  async generateAccessToken(payload: AuthPayload): Promise<string> {
    return jwt.sign({ ...payload, typ: TOKEN_TYPES.ACCESS }, privateKey, {
      algorithm: "RS256",
      expiresIn: "15m",
    });
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    const payload = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    }) as TokenPayload;
    if (payload.typ !== TOKEN_TYPES.ACCESS) {
      throw new Error("Invalid token type");
    }
    return payload;
  }

  async generateRefreshToken(payload: AuthPayload): Promise<string> {
    return jwt.sign({ ...payload, typ: TOKEN_TYPES.REFRESH }, privateKey, {
      algorithm: "RS256",
      expiresIn: "7d",
    });
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    const payload = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    }) as TokenPayload;
    if (payload.typ !== TOKEN_TYPES.REFRESH) {
      throw new Error("Invalid token type");
    }
    return payload;
  }
}