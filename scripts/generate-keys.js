import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { generateKeyPairSync } from "crypto";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const authKeyDir = path.join(__dirname, "../auth-service/key");
const gatewayKeyDir = path.join(__dirname, "../api-gateway/key");
const resourceKeyDir = path.join(__dirname, "../resource-service/key");

if (!fs.existsSync(authKeyDir)) {
  fs.mkdirSync(authKeyDir, { recursive: true });
}

if (!fs.existsSync(gatewayKeyDir)) {
  fs.mkdirSync(gatewayKeyDir, { recursive: true });
}

if (!fs.existsSync(resourceKeyDir)) {
  fs.mkdirSync(resourceKeyDir, { recursive: true });
}

/**
 * ======================
 * JWT RSA KEYS
 * ======================
 */

const jwtKeys = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

const jwtPrivate = jwtKeys.privateKey.export({
  type: "pkcs8",
  format: "pem",
});

const jwtPublic = jwtKeys.publicKey.export({
  type: "spki",
  format: "pem",
});

/* private -> auth-service */

fs.writeFileSync(
  path.join(authKeyDir, "jwt_private.key"),
  jwtPrivate
);

/* public -> auth-service */

fs.writeFileSync(
  path.join(authKeyDir, "jwt_public.pub"),
  jwtPublic
);

/* public -> api-gateway */

fs.writeFileSync(
  path.join(gatewayKeyDir, "jwt_public.pub"),
  jwtPublic
);

/* public -> resource-service */

fs.writeFileSync(
  path.join(resourceKeyDir, "jwt_public.pub"),
  jwtPublic
);

/**
 * ======================
 * PASETO Ed25519 KEYS
 * ======================
 */

const pasetoKeys = generateKeyPairSync("ed25519");

const pasetoPrivate = pasetoKeys.privateKey.export({
  type: "pkcs8",
  format: "pem",
});

const pasetoPublic = pasetoKeys.publicKey.export({
  type: "spki",
  format: "pem",
});

/* private -> auth-service */

fs.writeFileSync(
  path.join(authKeyDir, "paseto_private.key"),
  pasetoPrivate
);

/* public -> auth-service */

fs.writeFileSync(
  path.join(authKeyDir, "paseto_public.pub"),
  pasetoPublic
);

/* public -> api-gateway */

fs.writeFileSync(
  path.join(gatewayKeyDir, "paseto_public.pub"),
  pasetoPublic
);

/* public -> resource-service */

fs.writeFileSync(
  path.join(resourceKeyDir, "paseto_public.pub"),
  pasetoPublic
);

console.log("Keys generated successfully");