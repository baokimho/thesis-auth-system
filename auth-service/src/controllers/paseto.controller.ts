import { Request, Response } from "express";
import { RegisterRequest, LoginRequest, RefreshRequest, VerifyRequest } from "@shared/types/auth";
import { PASETOService } from "../token/paseto.service";
import { AuthService } from "../services/auth.service";
import { classifyRefreshError } from "../helpers/refreshError.helper";

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

export const pasetoLogin = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response
) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "PASETO login failed";
    res.status(401).json({ error: message });
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
  } catch (error) {
    const { status, code, message } = classifyRefreshError(error);
    res.status(status).json({ code, message });
  }
};

export const pasetoLogout = async (
  req: Request<{}, {}, RefreshRequest>,
  res: Response
) => {
  try {
    const result = await authService.logout(req.body);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "PASETO logout failed";
    res.status(401).json({ error: message });
  }
};