import express from "express";
import {
  jwtLogin,
  jwtRefresh,
  jwtRegister,
  jwtVerify,
} from "./controllers/jwt.controller";
import {
  pasetoLogin,
  pasetoRefresh,
  pasetoRegister,
  pasetoVerify,
} from "./controllers/paseto.controller";

const router = express.Router();

router.post("/jwt/register", jwtRegister);
router.post("/jwt/login", jwtLogin);
router.post("/jwt/verify", jwtVerify);
router.post("/jwt/refresh", jwtRefresh);

router.post("/paseto/register", pasetoRegister);
router.post("/paseto/login", pasetoLogin);
router.post("/paseto/verify", pasetoVerify);
router.post("/paseto/refresh", pasetoRefresh);

router.get("/health", (_req, res) => {
  res.send("Good");
});

export default router;