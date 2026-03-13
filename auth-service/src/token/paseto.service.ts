import { V4 } from "paseto";
import { createPrivateKey, createPublicKey } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";
import { AuthPayload, TokenPayload, TokenService } from "@shared/types/auth";

let privateKey: ReturnType<typeof createPrivateKey>;
let publicKey: ReturnType<typeof createPublicKey>;

try {
  privateKey = createPrivateKey(
    readFileSync(join(__dirname, "../../key/paseto_private.key"))
  );
  publicKey = createPublicKey(
    readFileSync(join(__dirname, "../../key/paseto_public.pub"))
  );
} catch (err) {
  console.error("[PASETOService] Failed to load keys:", err);
  process.exit(1);
}

const TOKEN_TYPES = {
  ACCESS: "access",
  REFRESH: "refresh",
} as const;

export class PASETOService implements TokenService {
  async generateAccessToken(payload: AuthPayload): Promise<string> {
    return V4.sign(
      { ...payload, typ: TOKEN_TYPES.ACCESS },
      privateKey,
      { expiresIn: "15m" }
    );
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    const payload = (await V4.verify(token, publicKey)) as TokenPayload;
    if (payload.typ !== TOKEN_TYPES.ACCESS) {
      throw new Error("Invalid token type");
    }
    return payload;
  }

  async generateRefreshToken(payload: AuthPayload): Promise<string> {
    return V4.sign(
      { ...payload, typ: TOKEN_TYPES.REFRESH },
      privateKey,
      { expiresIn: "7d" }
    );
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    const payload = (await V4.verify(token, publicKey)) as TokenPayload;
    if (payload.typ !== TOKEN_TYPES.REFRESH) {
      throw new Error("Invalid token type");
    }
    return payload;
  }
}