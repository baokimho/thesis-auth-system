import express from "express";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { V4 } from "paseto";
import { TokenPayload, TOKEN_TYPES } from "@shared/types/auth";

const app = express();

const jwtPublicKey = fs.readFileSync(
  path.join(__dirname, "../key/jwt_public.pub"),
  "utf8"
);

const pasetoPublicKey = fs.readFileSync(
  path.join(__dirname, "../key/paseto_public.pub"),
  "utf8"
);

app.use(express.json());

function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  return token || null;
}

function isAuthTokenPayload(payload: unknown): payload is TokenPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as TokenPayload;
  return (
    typeof candidate.userId === "number" &&
    typeof candidate.email === "string" &&
    candidate.typ === TOKEN_TYPES.ACCESS
  );
}

async function verifyAccessToken(token: string): Promise<TokenPayload> {
  try {
    const jwtPayload = jwt.verify(token, jwtPublicKey, {
      algorithms: ["RS256"],
    });

    if (isAuthTokenPayload(jwtPayload)) {
      return jwtPayload;
    }
  } catch {
    // Continue to PASETO verification.
  }

  const pasetoPayload = await V4.verify(token, pasetoPublicKey);

  if (!isAuthTokenPayload(pasetoPayload)) {
    throw new Error("Invalid token payload");
  }

  return pasetoPayload;
}

app.use(async (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        error: "Missing or invalid Authorization header",
      });
    }

    const payload = await verifyAccessToken(token);
    res.locals.user = payload;
    next();
  } catch {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
});

// test endpoint
app.get("/profile", (_req, res) => {
  const user = res.locals.user as TokenPayload;

  res.json({
    message: "Profile data from resource service",
    userId: user.userId,
    email: user.email,
  });
});

app.get("/orders", (_req, res) => {
  const user = res.locals.user as TokenPayload;

  res.json({
    message: "Orders for user",
    userId: user.userId,
    orders: ["order1", "order2"],
  });
});

app.listen(4000, () => {
  console.log("Resource service running on port 4000");
});