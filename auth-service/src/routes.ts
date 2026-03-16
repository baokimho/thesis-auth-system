import express, { Request, Response} from "express";
import { JWTService } from "./token/jwt.service";
import { PASETOService } from "./token/paseto.service";
import { AuthPayload, TokenPayload, VerifyRequest, RefreshRequest } from "@shared/types/auth"

const router = express.Router();
const jwtService = new JWTService();
const pasetoService = new PASETOService();

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};



/**
 * JWT LOGIN
 */
router.post("/jwt/login", async (_req: Request, res: Response) => {
  try {
    const payload: AuthPayload = {
      sub: 1,
      email: "test@example.com",
    };

    const accessToken = await jwtService.generateAccessToken(payload);
    const refreshToken = await jwtService.generateRefreshToken(payload);

    res.json({ accessToken, refreshToken });
  } catch {
    res.status(500).json({ error: "JWT generation failed" });
  }
});

/**
 * JWT VERIFY
 */
router.post("/jwt/verify", async (req: Request<{}, {}, VerifyRequest>, res: Response) => {
  try {
    const { token } = req.body;

    if (!isNonEmptyString(token)) {
      return res.status(400).json({ message: "token required" });
    }

    const payload:TokenPayload = await jwtService.verifyAccessToken(token);

    res.json({ valid: true, payload });
  } catch {
    res.status(401).json({ valid: false });
  }
});

/**
 * JWT REFRESH
 */
router.post("/jwt/refresh", async (req: Request<{}, {}, RefreshRequest>, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!isNonEmptyString(refreshToken)) {
      return res.status(400).json({ message: "refreshToken required" });
    }

    const payload:TokenPayload = await jwtService.verifyRefreshToken(refreshToken);
    const { sub, email } = payload;

    const newAccessToken = await jwtService.generateAccessToken({ sub, email });

    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

/**
 * PASETO LOGIN
 */
router.post("/paseto/login", async (_req: Request, res: Response) => {
  try {
    const payload: AuthPayload = {
      sub: 1,
      email: "test@example.com",
    };

    const accessToken = await pasetoService.generateAccessToken(payload);
    const refreshToken = await pasetoService.generateRefreshToken(payload);

    res.json({ accessToken, refreshToken });
  } catch {
    res.status(500).json({ error: "PASETO generation failed" });
  }
});

/**
 * PASETO VERIFY
 */
router.post("/paseto/verify", async (req: Request<{}, {}, VerifyRequest>, res: Response) => {
  try {
    const { token } = req.body;

    if (!isNonEmptyString(token)) {
      return res.status(400).json({ message: "token required" });
    }

    const payload:TokenPayload = await pasetoService.verifyAccessToken(token);

    res.json({ valid: true, payload });
  } catch {
    res.status(401).json({ valid: false });
  }
});

/**
 * PASETO REFRESH
 */
router.post("/paseto/refresh", async (req: Request<{}, {}, RefreshRequest>, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!isNonEmptyString(refreshToken)) {
      return res.status(400).json({ message: "refreshToken required" });
    }

    const payload:TokenPayload = await pasetoService.verifyRefreshToken(refreshToken);
    const { sub, email } = payload;

    const newAccessToken = await pasetoService.generateAccessToken({ sub, email });

    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

router.get("/health", (_req: Request, res: Response) => {
  res.send("Good");
});

export default router;