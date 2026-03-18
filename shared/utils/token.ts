import jwt from "jsonwebtoken";
import { V4 } from "paseto";
import { createPublicKey, KeyObject } from "crypto";
import { TokenPayload, TOKEN_TYPES } from "@shared/types/auth";

type CandidateTokenPayload = Omit<TokenPayload, "sub"> & { sub: number | string };

export function toTokenPayload(
  payload: unknown,
  expectedType?: (typeof TOKEN_TYPES)[keyof typeof TOKEN_TYPES]
): TokenPayload | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as CandidateTokenPayload;

  if (
    typeof candidate.email !== "string" ||
    (expectedType !== undefined && candidate.typ !== expectedType)
  ) {
    return null;
  }

  const normalizedSub =
    typeof candidate.sub === "number"
      ? candidate.sub
      : Number.parseInt(candidate.sub, 10);

  if (!Number.isFinite(normalizedSub)) {
    return null;
  }

  return {
    ...candidate,
    sub: normalizedSub,
  };
}

function isPasetoToken(token: string): boolean {
  return token.startsWith("v4.public.");
}

export async function verifyAccessToken(
  publicKey: string | KeyObject,
  token: string
): Promise<TokenPayload> {
  const normalizedPublicKey =
    isPasetoToken(token) && typeof publicKey === "string"
      ? createPublicKey(publicKey)
      : publicKey;

  const payload = isPasetoToken(token)
    ? await V4.verify(token, normalizedPublicKey)
    : jwt.verify(token, normalizedPublicKey, { algorithms: ["RS256"] });

  const normalizedPayload = toTokenPayload(payload, TOKEN_TYPES.ACCESS);

  if (!normalizedPayload) {
    throw new Error("Invalid access token payload");
  }

  return normalizedPayload;
}
