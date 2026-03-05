import express from "express";
import { JWTService } from "./token/jwt.service";
import { PASETOService } from "./token/paseto.service";

const router = express.Router();

const jwtService = new JWTService();
const pasetoService = new PASETOService();

/**
 * Login - JWT
 */
router.post("/login-jwt", (req, res) => {
  try {
    const payload = {
      userId: 1,
      email: "test@example.com",
    };

    const accessToken = jwtService.generateAccessToken(payload);
    const refreshToken = jwtService.generateRefreshToken(payload);

    res.json({
      type: "JWT",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ error: "JWT generation failed" });
  }
});

/**
 * Login - PASETO
 */
router.post("/login-paseto", async (req, res) => {
  try {
    const payload = {
      userId: 1,
      email: "test@example.com",
    };

    const accessToken = await pasetoService.generateAccessToken(payload);
    const refreshToken = await pasetoService.generateRefreshToken(payload);

    res.json({
      type: "PASETO",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ error: "PASETO generation failed" });
  }
});

/**
 * Verify JWT
 */
router.post("/verify-jwt", (req, res) => {
  try {
    const { token } = req.body;

    const payload = jwtService.verifyAccessToken(token);

    res.json({
      valid: true,
      payload,
    });
  } catch (error) {
    res.status(401).json({
      valid: false,
      error: "Invalid JWT",
    });
  }
});

/**
 * Verify PASETO
 */
router.post("/verify-paseto", async (req, res) => {
  try {
    const { token } = req.body;

    const payload = await pasetoService.verifyAccessToken(token);

    res.json({
      valid: true,
      payload,
    });
  } catch (error) {
    res.status(401).json({
      valid: false,
      error: "Invalid PASETO",
    });
  }
});

export default router;