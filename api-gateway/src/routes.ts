import express from "express";
import { jwtAuth } from "./middleware/jwtAuth.middleware";
import { pasetoAuth } from "./middleware/pasetoAuth.middleware";
import { injectInternalSecret } from "./middleware/internalSecretInject.middleware";
import { resourceProxy } from "./proxy/resource.proxy";
import {
  getJwtProtected,
  getPasetoProtected,
  getPublic,
} from "./controllers/gateway.controller";


const router = express.Router();

router.get("/public", getPublic);

router.get("/jwt-protected", jwtAuth, getJwtProtected);
router.get("/paseto-protected", pasetoAuth, getPasetoProtected);

router.use("/jwt-resource", jwtAuth, injectInternalSecret, resourceProxy);
router.use("/paseto-resource", pasetoAuth, injectInternalSecret, resourceProxy);

export default router;