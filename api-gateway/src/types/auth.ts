export interface AuthPayload {
  userId: number
  email: string
  iat?: number
  exp?: number
}