import { V4 } from "paseto";
import { generateKeyPairSync } from "crypto";

const { publicKey, privateKey } = generateKeyPairSync("ed25519");

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