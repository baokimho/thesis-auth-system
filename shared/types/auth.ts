export interface AuthPayload {
  userId: number
  email: string
  iat?: number
  exp?: number
}
export interface RefreshRequest {
  refreshToken: string;
}

export interface VerifyRequest {
  token: string;
}

export interface TokenPayload {
  userId: number;
  email: string;
}
export interface TokenService {
  generateAccessToken(payload: TokenPayload): Promise<string>;
  verifyAccessToken(token: string): Promise<TokenPayload>;

  generateRefreshToken(payload: TokenPayload): Promise<string>;
  verifyRefreshToken(token: string): Promise<TokenPayload>;
}