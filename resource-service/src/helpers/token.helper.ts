import { TokenPayload } from "@shared/types/auth";
import { verifyAccessToken } from "@shared/utils/token";

/**
 * Extracts Bearer token from Authorization header
 * @param authHeader Authorization header value (e.g., "Bearer token...")
 * @returns Token string or null if invalid format
 */
export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  return token || null;
}

/**
 * Checks if token is PASETO format (v4.public prefix)
 * @param token Token string to check
 * @returns True if PASETO, false if JWT
 */
export function isPasetoToken(token: string): boolean {
  return token.startsWith("v4.public.");
}

/**
 * Verifies access token (JWT or PASETO) for resource service
 * Auto-detects token type and uses appropriate public key
 * @param token Access token to verify
 * @param jwtPublicKey JWT public key
 * @param pasetoPublicKey PASETO public key
 * @returns Decoded and verified token payload
 */
export async function verifyAccessTokenForResource(
  token: string,
  jwtPublicKey: string,
  pasetoPublicKey: string
): Promise<TokenPayload> {
  const publicKey = isPasetoToken(token) ? pasetoPublicKey : jwtPublicKey;
  return verifyAccessToken(publicKey, token);
}
