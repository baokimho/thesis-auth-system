import { V4 } from "paseto";
import { createPrivateKey, createPublicKey } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";

const privateKey = createPrivateKey(
  readFileSync(join(__dirname, "../../key/paseto_private.key"))
);
const publicKey = createPublicKey(
  readFileSync(join(__dirname, "../../key/paseto_public.pub"))
);

export class PASETOService {
  async generateAccessToken(payload: any): Promise<string> {
    return await V4.sign(payload, privateKey, {
      expiresIn: "15m",
    });
  }

  async verifyAccessToken(token: string): Promise<any> {
    return await V4.verify(token, publicKey);
  }

  async generateRefreshToken(payload: any): Promise<string> {
    return await V4.sign(payload, privateKey, {
      expiresIn: "7d",
    });
  }

  async verifyRefreshToken(token: string): Promise<any> {
    return await V4.verify(token, publicKey);
  }
}