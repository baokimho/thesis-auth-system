import express from "express";
import { jwtAuth } from "./middleware/jwtAuth.middleware";
import { pasetoAuth } from "./middleware/pasetoAuth.middleware";
import { injectInternalSecret } from "./middleware/internalSecretInject.middleware";
import { resourceProxy } from "./proxy/resource.proxy";
import { authProxy } from "./proxy/auth.proxy";
import {
  getJwtProtected,
  getPasetoProtected,
  getPublic,
} from "./controllers/gateway.controller";
import {
  authRateLimit,
  resourceRateLimit,
} from "./middleware/rateLimit.middleware";


const router = express.Router();

router.get("/public", getPublic);
router.get("/jwt-protected", jwtAuth, getJwtProtected);
router.get("/paseto-protected", pasetoAuth, getPasetoProtected);

router.use("/auth", authRateLimit, injectInternalSecret, authProxy);

router.use(
  "/jwt-resource",
  jwtAuth,
  resourceRateLimit,
  injectInternalSecret,
  resourceProxy
);

router.use(
  "/paseto-resource",
  pasetoAuth,
  resourceRateLimit,
  injectInternalSecret,
  resourceProxy
);

export default router;