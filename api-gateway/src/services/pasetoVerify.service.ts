import { V4 } from "paseto"
import path from "path"
import { TokenPayload, TOKEN_TYPES } from "@shared/types/auth"
import { readUtf8File } from "@shared/utils/file"
import { verifyAccessToken } from "@shared/utils/token"

export class PasetoVerifyService {
  private publicKey: string

  constructor() {
    this.publicKey = readUtf8File(path.join(__dirname, "../../key/paseto_public.pub"))
  }

  private async verifyToken(token: string): Promise<TokenPayload> {
    const payload = (await V4.verify(token, this.publicKey)) as TokenPayload

    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid token payload")
    }

    return payload
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    return verifyAccessToken(this.publicKey, token)
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    const payload = await this.verifyToken(token)

    if (payload.typ !== TOKEN_TYPES.REFRESH) {
      throw new Error("Invalid token type")
    }

    return payload
  }
}