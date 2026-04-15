import "dotenv/config";
import express from "express";
import path from "path";
import { TokenPayload } from "@shared/types/auth";
import { readUtf8File } from "@shared/utils/file";
import { validateInternalSecret } from "./middleware/internalSecretValidate.middleware";
import { tokenAuthMiddleware } from "./middleware/tokenAuth.middleware";

const app = express();

const jwtPublicKey = readUtf8File(path.join(__dirname, "../key/jwt_public.pub"));

const pasetoPublicKey = readUtf8File(path.join(__dirname, "../key/paseto_public.pub"));

app.use(express.json());

// Apply middleware
app.use(validateInternalSecret);
app.use(tokenAuthMiddleware(jwtPublicKey, pasetoPublicKey));

// test endpoint
app.get("/profile", (_req, res) => {
  const user = res.locals.user as TokenPayload;

  res.json({
    message: "Profile data from resource service",
    sub: user.sub,
    email: user.email,
  });
});

app.get("/orders", (_req, res) => {
  const user = res.locals.user as TokenPayload;

  res.json({
    message: "Orders for user",
    sub: user.sub,
    orders: ["order1", "order2"],
  });
});

app.listen(4000, () => {
  console.log("Resource service running on port 4000");
});