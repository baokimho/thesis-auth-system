import { V4 } from "paseto"
import fs from "fs"
import path from "path"

export class PasetoVerifyService {
  private publicKey: string

  constructor() {
    this.publicKey = fs.readFileSync(
      path.join(__dirname, "../../key/paseto_public.pub"),
      "utf8"
    )
  }

  async verify(token: string) {
    return await V4.verify(token, this.publicKey)
  }
}