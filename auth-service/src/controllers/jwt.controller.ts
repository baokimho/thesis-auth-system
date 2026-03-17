import { Request, Response } from "express";
import { RegisterRequest, RefreshRequest, VerifyRequest } from "@shared/types/auth";
import { JWTService } from "../token/jwt.service";
import { AuthService } from "../services/auth.service";

const jwtService = new JWTService();
const authService = new AuthService(jwtService);

export const jwtRegister = async (
  req: Request<{}, {}, RegisterRequest>,
  res: Response
) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "JWT register failed";
    if (message === "Email already registered") {
      return res.status(409).json({ message });
    }
    res.status(400).json({ message });
  }
};

export const jwtLogin = async (_req: Request, res: Response) => {
  try {
    const result = await authService.login();
    res.json(result);
  } catch {
    res.status(500).json({ error: "JWT generation failed" });
  }
};

export const jwtVerify = async (
  req: Request<{}, {}, VerifyRequest>,
  res: Response
) => {
  try {
    const result = await authService.verify(req.body);
    res.json(result);
  } catch {
    res.status(401).json({ valid: false });
  }
};

export const jwtRefresh = async (
  req: Request<{}, {}, RefreshRequest>,
  res: Response
) => {
  try {
    const result = await authService.refresh(req.body);
    res.json(result);
  } catch {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};