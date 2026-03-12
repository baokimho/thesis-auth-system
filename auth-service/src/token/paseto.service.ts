import { V4 } from "paseto";
import { createPrivateKey, createPublicKey } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";
import { AuthPayload, TokenPayload, TokenService } from "@shared/types/auth";

const privateKey = createPrivateKey(
  readFileSync(join(__dirname, "../../key/paseto_private.key"))
);
const publicKey = createPublicKey(
  readFileSync(join(__dirname, "../../key/paseto_public.pub"))
);

export class PASETOService implements TokenService{
  async generateAccessToken(payload: AuthPayload): Promise<string> {
    return V4.sign(payload as unknown as Record<string, unknown>, privateKey, {
      expiresIn: "15m",
    });
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    return V4.verify(token, publicKey);
  }

  async generateRefreshToken(payload: AuthPayload): Promise<string> {
    return V4.sign(payload as unknown as Record<string, unknown>, privateKey, {
      expiresIn: "7d",
    });
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    return V4.verify(token, publicKey);
  }
}