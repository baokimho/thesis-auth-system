export interface AuthPayload {
  userId: number
  email: string
}
export interface RefreshRequest {
  readonly refreshToken: string;
}

export interface TokenClaims {
  typ?: "access" | "refresh";
  iat?: string | number;
  exp?: string | number;
}

export interface VerifyRequest {
  readonly token: string;
}

export type TokenPayload = AuthPayload & TokenClaims
export interface TokenService {
  generateAccessToken(payload: AuthPayload): Promise<string>;
  verifyAccessToken(token: string): Promise<TokenPayload>;

  generateRefreshToken(payload: AuthPayload): Promise<string>;
  verifyRefreshToken(token: string): Promise<TokenPayload>;
}