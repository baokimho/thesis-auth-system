# Thesis Auth System

Distributed authentication system to compare JWT (RS256) and PASETO (v4.public) in a microservice architecture.

## Overview

This project demonstrates:

- JWT and PASETO token issuance and verification.
- Access token + refresh token flow with rotation.
- API Gateway as a single public entry point.
- Internal service-to-service trust boundary using `x-internal-secret`.
- Shared token verification logic for both gateway and resource service.

## Architecture

Services:

- `api-gateway` (`http://localhost:3000`)
- `auth-service` (`http://localhost:3001`)
- `resource-service` (`http://localhost:4000`)

Responsibilities:

- `auth-service`
	- Register/login users.
	- Issue JWT or PASETO access/refresh tokens.
	- Verify tokens.
	- Refresh token rotation and reuse detection.
- `api-gateway`
	- Public entrypoint (`/api/*`).
	- Auth and resource rate limiting.
	- Token auth middleware.
	- Proxy to internal services.
	- Inject trusted `x-internal-secret` header.
- `resource-service`
	- Validates internal secret.
	- Re-verifies bearer access token.
	- Exposes protected resources.

Shared code:

- `shared/types`: common auth types.
- `shared/utils/token.ts`: common token normalization/verification helpers.

## Token Design

JWT:

- Algorithm: `RS256`.
- Access token TTL: `15m`.
- Refresh token TTL: `7d`.

PASETO:

- Version: `v4.public` (Ed25519).
- Access token TTL: `15m`.
- Refresh token TTL: `7d`.
- `sub` is encoded as string when signing (library claim requirement), then normalized back to number on verification.

## Tech Stack

- Node.js + TypeScript
- Express
- Prisma + PostgreSQL
- `jsonwebtoken` + `paseto`
- `http-proxy-middleware`
- `express-rate-limit`

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL

## Project Structure

Top-level packages:

- `api-gateway/`
- `auth-service/`
- `resource-service/`
- `shared/`
- `scripts/`
- `REST/` (HTTP request collection files for manual testing)

## Environment Variables

Create `.env` for each service as needed.

Required:

- For `auth-service`:
	- `DATABASE_URL` (PostgreSQL connection string)
	- `INTERNAL_SECRET` (must match gateway/resource)
- For `api-gateway`:
	- `INTERNAL_SECRET` (must match auth/resource)
- For `resource-service`:
	- `INTERNAL_SECRET` (must match gateway/auth)

Optional (gateway rate limit):

- `AUTH_RATE_LIMIT_WINDOW_MS` (default `60000`)
- `AUTH_RATE_LIMIT_MAX` (default `20`)
- `RESOURCE_RATE_LIMIT_WINDOW_MS` (default `60000`)
- `RESOURCE_RATE_LIMIT_MAX` (default `60`)

## Setup

From repository root:

```bash
npm install
npm --prefix api-gateway install
npm --prefix auth-service install
npm --prefix resource-service install
```

Generate key pairs (JWT RSA + PASETO Ed25519):

```bash
npm run gen-keys
```

Run Prisma migration (auth-service):

```bash
npm --prefix auth-service run prisma:generate
npx --prefix auth-service prisma migrate deploy
```

For local development (if you create new schema changes):

```bash
npx --prefix auth-service prisma migrate dev
```

## Run

Run all services concurrently:

```bash
npm run dev:all
```

Or run one by one:

```bash
npm run dev:auth
npm run dev:gateway
npm run dev:resource
```

## API Flow

Public endpoints through gateway:

- `GET /api/public`
- `GET /api/jwt-protected`
- `GET /api/paseto-protected`
- `POST /api/auth/jwt/register`
- `POST /api/auth/jwt/login`
- `POST /api/auth/jwt/verify`
- `POST /api/auth/jwt/refresh`
- `POST /api/auth/jwt/logout`
- `POST /api/auth/paseto/register`
- `POST /api/auth/paseto/login`
- `POST /api/auth/paseto/verify`
- `POST /api/auth/paseto/refresh`
- `POST /api/auth/paseto/logout`
- `GET /api/auth` (health via proxy to auth-service)

Resource endpoints through gateway:

- JWT route prefix: `/api/jwt-resource/*`
- PASETO route prefix: `/api/paseto-resource/*`

Examples after rewrite:

- `/api/jwt-resource/profile`
- `/api/paseto-resource/orders`

## Testing With HTTP Files

Use files in `REST/`:

- `gateway-auth-flow.http`
- `jwt-flow.http`
- `paseto-flow.http`
- `jwt-logout-flow.http`
- `paseto-logout-flow.http`
- `jwt-abuse-edge.http`
- `paseto-abuse-edge.http`

These files cover:

- register/login/verify
- refresh token rotation
- logout behavior
- abuse/reuse edge cases

## Security Notes

- Gateway strips any client `x-internal-secret` and injects trusted internal secret.
- `auth-service` and `resource-service` reject requests without valid internal secret.
- Refresh tokens are stored as hashes in database.
- Refresh token reuse triggers revocation of all active refresh tokens for that user.

## Troubleshooting

If `npm run dev:all` exits with code 1:

- Ensure all `.env` files exist and `INTERNAL_SECRET` matches across services.
- Ensure `DATABASE_URL` is set and PostgreSQL is reachable.
- Re-run key generation: `npm run gen-keys`.
- Reinstall dependencies in each package.
- Re-run Prisma generate/migrations for auth-service.

If TypeScript shows path/rootDir errors:

- Confirm each service uses local TypeScript from its own `node_modules`.
- Reinstall package dependencies after changing `tsconfig` or TS version.

## License

ISC