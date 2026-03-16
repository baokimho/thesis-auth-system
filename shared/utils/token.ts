import jwt from "jsonwebtoken";
import { V4 } from "paseto";
import { TokenPayload, TOKEN_TYPES } from "@shared/types/auth";

function isAccessTokenPayload(payload: unknown): payload is TokenPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as TokenPayload;
  return (
    typeof candidate.userId === "number" &&
    typeof candidate.email === "string" &&
    candidate.typ === TOKEN_TYPES.ACCESS
  );
}

function isPasetoToken(token: string): boolean {
  return token.startsWith("v4.public.");
}

export async function verifyAccessToken(
  publicKey: string,
  token: string
): Promise<TokenPayload> {
  const payload = isPasetoToken(token)
    ? await V4.verify(token, publicKey)
    : jwt.verify(token, publicKey, { algorithms: ["RS256"] });

  if (!isAccessTokenPayload(payload)) {
    throw new Error("Invalid access token payload");
  }

  return payload;
}
