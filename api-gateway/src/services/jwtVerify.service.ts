import jwt from "jsonwebtoken";
import fs from "fs";

export class JWTVerifyService {
  private publicKey: string;

  constructor() {
    this.publicKey = fs.readFileSync("key/jwt_public.pub", "utf8");
  }

  verify(token: string) {
    return jwt.verify(token, this.publicKey, {
      algorithms: ["RS256"],
    });
  }
}