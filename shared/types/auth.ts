export interface AuthPayload {
  userId: number
  email: string
}
export interface RefreshRequest {
  refreshToken: string;
}

export interface VerifyRequest {
  token: string;
}

export type TokenPayload = AuthPayload & Record<string, unknown>
export interface TokenService {
  generateAccessToken(payload: TokenPayload): Promise<string>;
  verifyAccessToken(token: string): Promise<TokenPayload>;

  generateRefreshToken(payload: TokenPayload): Promise<string>;
  verifyRefreshToken(token: string): Promise<TokenPayload>;
}