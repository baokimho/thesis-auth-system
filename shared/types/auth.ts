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