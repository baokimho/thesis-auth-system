import express from "express";
import path from "path";
import { TokenPayload } from "@shared/types/auth";
import { readUtf8File } from "@shared/utils/file";
import { verifyAccessToken } from "@shared/utils/token";

const app = express();

const jwtPublicKey = readUtf8File(path.join(__dirname, "../key/jwt_public.pub"));

const pasetoPublicKey = readUtf8File(path.join(__dirname, "../key/paseto_public.pub"));

app.use(express.json());

function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  return token || null;
}

function isPasetoToken(token: string): boolean {
  return token.startsWith("v4.public.");
}

async function verifyAccessTokenForResource(token: string): Promise<TokenPayload> {
  const publicKey = isPasetoToken(token) ? pasetoPublicKey : jwtPublicKey;
  return verifyAccessToken(publicKey, token);
}

app.use(async (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        error: "Missing or invalid Authorization header",
      });
    }

    const payload = await verifyAccessTokenForResource(token);
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