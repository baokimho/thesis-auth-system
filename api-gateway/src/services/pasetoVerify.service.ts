import { V4 } from "paseto"
import path from "path"
import { createPublicKey } from "crypto"
import { TokenPayload, TOKEN_TYPES } from "@shared/types/auth"
import { readUtf8File } from "@shared/utils/file"
import { toTokenPayload, verifyAccessToken } from "@shared/utils/token"

let publicKeyPem: string
let publicKey: ReturnType<typeof createPublicKey>

try {
  publicKeyPem = readUtf8File(path.join(__dirname, "../../key/paseto_public.pub"))
  publicKey = createPublicKey(publicKeyPem)
} catch (err) {
  console.error("[PasetoVerifyService] Failed to load keys:", err)
  process.exit(1)
}

export class PasetoVerifyService {
  private async verifyToken(token: string): Promise<TokenPayload> {
    const payload = await V4.verify(token, publicKey)
    const normalizedPayload = toTokenPayload(payload)

    if (!normalizedPayload) {
      throw new Error("Invalid token payload")
    }

    return normalizedPayload
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    return verifyAccessToken(publicKeyPem, token)
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    const payload = await this.verifyToken(token)

    if (payload.typ !== TOKEN_TYPES.REFRESH) {
      throw new Error("Invalid token type")
    }

    return payload
  }
}