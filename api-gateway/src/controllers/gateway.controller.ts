import { Request, Response } from "express";

export const getPublic = (_req: Request, res: Response) => {
  res.json({
    message: "Public endpoint",
  });
};

export const getJwtProtected = (req: Request, res: Response) => {
  res.json({
    message: "Protected endpoint by JWT",
    user: req.user,
  });
};

export const getPasetoProtected = (req: Request, res: Response) => {
  res.json({
    message: "Protected endpoint by PASETO",
    user: req.user,
  });
};