const { generateKeyPairSync } = require("crypto")
const fs = require("fs")
const path = require("path")

const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
})

const authPrivate = path.join(__dirname, "../auth-service/keys/private.key")
const authPublic = path.join(__dirname, "../auth-service/keys/public.key")
const resourcePublic = path.join(__dirname, "../resource-service/keys/public.key")

fs.writeFileSync(authPrivate, privateKey)
fs.writeFileSync(authPublic, publicKey)
fs.writeFileSync(resourcePublic, publicKey)

console.log("RSA keys generated successfully.");