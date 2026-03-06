import express from "express";
import { jwtAuth } from "./middleware/jwtAuth.middleware";

const router = express.Router();

router.get("/public", (_req, res) => {
  res.json({
    message: "Public endpoint",
  });
});

router.get("/protected", jwtAuth, (req, res) => {
  res.json({
    message: "Protected endpoint",
    user: req.user,
  });
});

export default router;