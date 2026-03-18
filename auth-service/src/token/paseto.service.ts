import { V4 } from "paseto";
import { createPrivateKey, createPublicKey } from "crypto";
import { join } from "path";
import { AuthPayload, TokenPayload, TokenService, TOKEN_TYPES } from "@shared/types/auth";
import { readUtf8File } from "@shared/utils/file";
import { toTokenPayload, verifyAccessToken } from "@shared/utils/token";

let privateKey: ReturnType<typeof createPrivateKey>;
let publicKey: ReturnType<typeof createPublicKey>;
let publicKeyPem: string;

try {
  publicKeyPem = readUtf8File(join(__dirname, "../../key/paseto_public.pub"));
  privateKey = createPrivateKey(
    readUtf8File(join(__dirname, "../../key/paseto_private.key"))
  );
  publicKey = createPublicKey(
    publicKeyPem
  );
} catch (err) {
  console.error("[PASETOService] Failed to load keys:", err);
  process.exit(1);
}

export class PASETOService implements TokenService {
  async generateAccessToken(payload: AuthPayload): Promise<string> {
    const pasetoPayload = { ...payload, sub: String(payload.sub) };

    return V4.sign(
      { ...pasetoPayload, typ: TOKEN_TYPES.ACCESS },
      privateKey,
      { expiresIn: "15m" }
    );
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    return verifyAccessToken(publicKeyPem, token);
  }

  async generateRefreshToken(payload: AuthPayload): Promise<string> {
    const pasetoPayload = { ...payload, sub: String(payload.sub) };

    return V4.sign(
      { ...pasetoPayload, typ: TOKEN_TYPES.REFRESH },
      privateKey,
      { expiresIn: "7d" }
    );
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    const decoded = await V4.verify(token, publicKey);
    const payload = toTokenPayload(decoded, TOKEN_TYPES.REFRESH);

    if (!payload) {
      throw new Error("Invalid token payload");
    }

    return payload;
  }
}