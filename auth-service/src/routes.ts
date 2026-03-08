import express from "express";
import { JWTService } from "./token/jwt.service";
import { PASETOService } from "./token/paseto.service";

const router = express.Router();

const jwtService = new JWTService();
const pasetoService = new PASETOService();

/**
 * JWT LOGIN
 */
router.post("/jwt/login", (req, res) => {
  try {
    const payload = {
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
router.post("/jwt/verify", (req, res) => {
  try {
    const { token } = req.body;

    const payload = jwtService.verifyAccessToken(token);

    res.json({ valid: true, payload });
  } catch {
    res.status(401).json({ valid: false });
  }
});

/**
 * JWT REFRESH
 */
router.post("/jwt/refresh", (req, res) => {
  try {
    const { refreshToken } = req.body;

    const payload = jwtService.verifyRefreshToken(refreshToken);

    const newAccessToken = jwtService.generateAccessToken({
      userId: payload.userId,
      email: payload.email,
    });

    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

/**
 * PASETO LOGIN
 */
router.post("/paseto/login", async (req, res) => {
  try {
    const payload = {
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
router.post("/paseto/verify", async (req, res) => {
  try {
    const { token } = req.body;

    const payload = await pasetoService.verifyAccessToken(token);

    res.json({ valid: true, payload });
  } catch {
    res.status(401).json({ valid: false });
  }
});

/**
 * PASETO REFRESH
 */
router.post("/paseto/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const payload = await pasetoService.verifyRefreshToken(refreshToken);

    const newAccessToken = await pasetoService.generateAccessToken({
      userId: payload.userId,
      email: payload.email,
    });

    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

router.get("/health", (_req, res) => {
  res.send("Good");
});

export default router;