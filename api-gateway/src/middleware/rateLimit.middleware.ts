import { Request } from "express";
import rateLimit from "express-rate-limit";

function getNumberFromEnv(name: string, fallback: number): number {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number(rawValue);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
}

function getIpKey(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown-ip";
}

export const authRateLimit = rateLimit({
  windowMs: getNumberFromEnv("AUTH_RATE_LIMIT_WINDOW_MS", 60 * 1000),
  max: getNumberFromEnv("AUTH_RATE_LIMIT_MAX", 20),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => getIpKey(req),
  message: {
    error: "Too many auth requests, please try again later.",
  },
});

export const resourceRateLimit = rateLimit({
  windowMs: getNumberFromEnv("RESOURCE_RATE_LIMIT_WINDOW_MS", 60 * 1000),
  max: getNumberFromEnv("RESOURCE_RATE_LIMIT_MAX", 60),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    if (req.user?.sub !== undefined) {
      return `user-${req.user.sub}`;
    }

    return `ip-${getIpKey(req)}`;
  },
  message: {
    error: "Too many resource requests, please try again later.",
  },
});
