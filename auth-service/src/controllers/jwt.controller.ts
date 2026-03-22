import { Request, Response } from "express";
import { RegisterRequest, LoginRequest, RefreshRequest, VerifyRequest } from "@shared/types/auth";
import { JWTService } from "../token/jwt.service";
import { AuthService } from "../services/auth.service";
import { classifyRefreshError } from "../helpers/refreshError.helper";

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

export const jwtLogin = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response
) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "JWT login failed";
    res.status(401).json({ error: message });
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
  } catch (error) {
    const { status, code, message } = classifyRefreshError(error);
    res.status(status).json({ code, message });
  }
};

export const jwtLogout = async (
  req: Request<{}, {}, RefreshRequest>,
  res: Response
) => {
  try {
    const result = await authService.logout(req.body);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "JWT logout failed";
    res.status(401).json({ error: message });
  }
};