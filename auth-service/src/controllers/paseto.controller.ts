import { Request, Response } from "express";
import { RegisterRequest, RefreshRequest, VerifyRequest } from "@shared/types/auth";
import { PASETOService } from "../token/paseto.service";
import { AuthService } from "../services/auth.service";

const pasetoService = new PASETOService();
const authService = new AuthService(pasetoService);

export const pasetoRegister = async (
  req: Request<{}, {}, RegisterRequest>,
  res: Response
) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "PASETO register failed";
    if (message === "Email already registered") {
      return res.status(409).json({ message });
    }
    res.status(400).json({ message });
  }
};

export const pasetoLogin = async (_req: Request, res: Response) => {
  try {
    const result = await authService.login();
    res.json(result);
  } catch {
    res.status(500).json({ error: "PASETO generation failed" });
  }
};

export const pasetoVerify = async (
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

export const pasetoRefresh = async (
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