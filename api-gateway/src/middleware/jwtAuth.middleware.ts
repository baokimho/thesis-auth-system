import { Request, Response, NextFunction } from "express"
import { JWTVerifyService } from "../services/jwtVerify.service"
import { AuthPayload } from "../types/auth"

const jwtService = new JWTVerifyService()


export const jwtAuth = (
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

    if (!token) {
      return res.status(401).json({
        error: "Token missing",
      })
    }

    const decoded = jwtService.verify(token)

    if (typeof decoded === "string") {
      return res.status(401).json({
        error: "Invalid token payload",
      })
    }

    req.user = decoded as AuthPayload

    next()
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired token",
    })
  }
}