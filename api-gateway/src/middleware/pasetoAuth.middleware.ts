import { Request, Response, NextFunction } from "express"
import { AuthPayload } from "../types/auth"
import { PasetoVerifyService } from "../services/pasetoVerify.service"

const pasetoService = new PasetoVerifyService()

function isAuthPayload(payload: any): payload is AuthPayload {
  return (
    payload &&
    typeof payload === "object" &&
    typeof payload.userId === "number" &&
    typeof payload.email === "string"
  )
}

export const pasetoAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        error: "No authorization header",
      })
    }

    const token = authHeader.split(" ")[1]

    if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
        error: "Invalid authorization format",
    })
    }

    if (!token) {
      return res.status(401).json({
        error: "Token missing",
      })
    }

    const payload = await pasetoService.verify(token)

    if (!isAuthPayload(payload)) {
    return res.status(401).json({
        error: "Invalid token payload",
    })
    }

    req.user = payload as AuthPayload

    // forward user info
    req.headers["x-user-id"] = payload.userId.toString()
    req.headers["x-user-email"] = payload.email

    next()
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired token",
    })
  }
}