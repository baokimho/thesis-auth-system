export interface AuthPayload {
  sub: number
  email: string
}
export interface RefreshRequest {
  readonly refreshToken: string;
}

export const TOKEN_TYPES = {
  ACCESS: "access",
  REFRESH: "refresh",
} as const;

export interface TokenClaims {
  typ?: (typeof TOKEN_TYPES)[keyof typeof TOKEN_TYPES];
  iat?: string | number;
  exp?: string | number;
}

export interface VerifyRequest {
  readonly token: string;
}

export interface RegisterRequest {
  readonly email: string;
  readonly password: string;
}

export type TokenPayload = AuthPayload & TokenClaims
export interface TokenService {
  generateAccessToken(payload: AuthPayload): Promise<string>;
  verifyAccessToken(token: string): Promise<TokenPayload>;

  generateRefreshToken(payload: AuthPayload): Promise<string>;
  verifyRefreshToken(token: string): Promise<TokenPayload>;
}