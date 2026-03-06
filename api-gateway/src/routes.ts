import express from "express";
import { jwtAuth } from "./middleware/jwtAuth.middleware";
import { pasetoAuth } from "./middleware/pasetoAuth.middleware";

const router = express.Router();

router.get("/public", (_req, res) => {
  res.json({
    message: "Public endpoint",
  });
});

router.get("/jwt-protected", jwtAuth, (req, res) => {
  res.json({
    message: "Protected endpoint by JWT",
    user: req.user,
  });
});
router.get("/paseto-protected", pasetoAuth, (req, res) => {
  res.json({
    message: "Protected endpoint by PASETO",
    user: req.user,
  });
});

export default router;