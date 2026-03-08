import express, { Request, Response} from "express";
import { JWTService } from "./token/jwt.service";
import { PASETOService } from "./token/paseto.service";

const router = express.Router();

const jwtService = new JWTService();
const pasetoService = new PASETOService();

interface RefreshRequest {
  refreshToken: string;
}

interface VerifyRequest {
  token: string;
}

interface TokenPayload {
  userId: number;
  email: string;
}

/**
 * JWT LOGIN
 */
router.post("/jwt/login", (_req: Request, res: Response) => {
  try {
    const payload: TokenPayload = {
      userId: 1,
      email: "test@example.com",
    };

    const accessToken = jwtService.generateAccessToken(payload);
    const refreshToken = jwtService.generateRefreshToken(payload);

    res.json({ accessToken, refreshToken });
  } catch {
    res.status(500).json({ error: "JWT generation failed" });
  }
});

/**
 * JWT VERIFY
 */
router.post("/jwt/verify", (req: Request<{}, {}, VerifyRequest>, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "token required" });
    }

    const payload:TokenPayload = jwtService.verifyAccessToken(token);

    res.json({ valid: true, payload });
  } catch {
    res.status(401).json({ valid: false });
  }
});

/**
 * JWT REFRESH
 */
router.post("/jwt/refresh", (req: Request<{}, {}, RefreshRequest>, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "refreshToken required" });
    }

    const payload:TokenPayload = jwtService.verifyRefreshToken(refreshToken);

    const newAccessToken = jwtService.generateAccessToken(payload);

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
    const payload: TokenPayload = {
      userId: 1,
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

    if (!token) {
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

    if (!refreshToken) {
      return res.status(400).json({ message: "refreshToken required" });
    }

    const payload:TokenPayload = await pasetoService.verifyRefreshToken(refreshToken);

    const newAccessToken = await pasetoService.generateAccessToken(payload);

    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

router.get("/health", (_req: Request, res: Response) => {
  res.send("Good");
});

export default router;