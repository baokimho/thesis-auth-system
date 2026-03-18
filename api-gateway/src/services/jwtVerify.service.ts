import jwt from "jsonwebtoken";
import path from "path";
import { createPublicKey } from "crypto"
import { TokenPayload, TOKEN_TYPES } from "@shared/types/auth"
import { readUtf8File } from "@shared/utils/file"
import { toTokenPayload, verifyAccessToken } from "@shared/utils/token"

let publicKeyPem: string
let publicKey: ReturnType<typeof createPublicKey>

try {
  publicKeyPem = readUtf8File(path.join(__dirname, "../../key/jwt_public.pub"))
  publicKey = createPublicKey(publicKeyPem)
} catch (err) {
  console.error("[JWTVerifyService] Failed to load keys:", err)
  process.exit(1)
}

export class JWTVerifyService {
  private async verifyToken(token: string): Promise<TokenPayload> {
    const payload = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    });

    const normalizedPayload = toTokenPayload(payload, TOKEN_TYPES.REFRESH);

    if (!normalizedPayload) {
      throw new Error("Invalid token payload");
    }

    return normalizedPayload;
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    return verifyAccessToken(publicKeyPem, token);
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    return this.verifyToken(token);
  }
}