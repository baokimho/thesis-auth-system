import { V4 } from "paseto"
import fs from "fs"
import path from "path"
import { TokenPayload, TOKEN_TYPES } from "@shared/types/auth"

export class PasetoVerifyService {
  private publicKey: string

  constructor() {
    this.publicKey = fs.readFileSync(
      path.join(__dirname, "../../key/paseto_public.pub"),
      "utf8"
    )
  }

  private async verifyToken(token: string): Promise<TokenPayload> {
    const payload = (await V4.verify(token, this.publicKey)) as TokenPayload

    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid token payload")
    }

    return payload
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    const payload = await this.verifyToken(token)

    if (payload.typ !== TOKEN_TYPES.ACCESS) {
      throw new Error("Invalid token type")
    }

    return payload
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    const payload = await this.verifyToken(token)

    if (payload.typ !== TOKEN_TYPES.REFRESH) {
      throw new Error("Invalid token type")
    }

    return payload
  }
}