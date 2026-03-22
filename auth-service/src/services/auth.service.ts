import bcrypt from "bcrypt";
import {
  AuthPayload,
  LoginRequest,
  RefreshRequest,
  RegisterRequest,
  TokenPayload,
  TokenService,
  VerifyRequest,
} from "@shared/types/auth";
import { prisma } from "../lib/prisma";
import { isNonEmptyString } from "../helpers/string.helper";
import { hashToken } from "../helpers/token.helper";

const BCRYPT_SALT_ROUNDS = 10;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const REFRESH_TOKEN_CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
const REVOKED_TOKEN_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

let lastRefreshTokenCleanupAt = 0;

const revokeAllActiveRefreshTokensForUser = async (userId: number) => {
  await prisma.refreshTokens.updateMany({
    where: {
      userId,
      revokeAt: null,
    },
    data: {
      revokeAt: new Date()
    }
  })
}

const maybeCleanupRefreshTokens = async () => {
  const nowMs = Date.now();

  if (nowMs - lastRefreshTokenCleanupAt < REFRESH_TOKEN_CLEANUP_INTERVAL_MS) {
    return;
  }

  lastRefreshTokenCleanupAt = nowMs;
  const now = new Date(nowMs);
  const revokedRetentionCutoff = new Date(nowMs - REVOKED_TOKEN_RETENTION_MS);

  await prisma.refreshTokens.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: now } },
        {
          revokeAt: {
            not: null,
            lt: revokedRetentionCutoff,
          },
        },
      ],
    },
  });
}

export class AuthService {
  constructor(private tokenService: TokenService) {}

  async register(req: Pick<RegisterRequest, "email" | "password">) {
    const { email, password } = req;

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      throw new Error("email and password required");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new Error("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
      },
    });

    const payload: AuthPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.tokenService.generateAccessToken(payload);
    const refreshToken = await this.tokenService.generateRefreshToken(payload);
    const tokenHash = hashToken(refreshToken)
    await prisma.refreshTokens.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      }
    })

    return { accessToken, refreshToken };
  }

  async login(req: Pick<LoginRequest, "email" | "password">) {
    const { email, password } = req;

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      throw new Error("email and password required");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const payload: AuthPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.tokenService.generateAccessToken(payload);
    const refreshToken = await this.tokenService.generateRefreshToken(payload);

    const tokenHash = hashToken(refreshToken);

    await prisma.refreshTokens.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });

    return { accessToken, refreshToken };
  }

  async verify(req: Pick<VerifyRequest, "token">) {
    const { token } = req;

    if (!isNonEmptyString(token)) {
      throw new Error("token required");
    }

    const payload: TokenPayload = await this.tokenService.verifyAccessToken(token);

    return { valid: true, payload };
  }

  async refresh(req: Pick<RefreshRequest, "refreshToken">) {
    const { refreshToken } = req;

    if (!isNonEmptyString(refreshToken)) {
      throw new Error("refreshToken required");
    }

    const tokenHash = hashToken(refreshToken)
    const existing = await prisma.refreshTokens.findFirst({
      where: { tokenHash }
    })
    if (!existing) {
      throw new Error("Invalid refresh token")
    }

    if (existing.revokeAt){
      await revokeAllActiveRefreshTokensForUser(existing.userId)
      throw new Error("Token reused detected")
    }

    if (existing.expiresAt < new Date()) {
      throw new Error("Token expired")
    }

    const payload: TokenPayload = await this.tokenService.verifyRefreshToken(refreshToken);
    const { sub, email } = payload;

    if (sub !== existing.userId) {
      await revokeAllActiveRefreshTokensForUser(existing.userId);
      throw new Error("Refresh token user mismatch");
    }

    const nextAuthPayload: AuthPayload = { sub, email };
    const newAccessToken = await this.tokenService.generateAccessToken(nextAuthPayload);
    const newRefreshToken = await this.tokenService.generateRefreshToken(nextAuthPayload)
    const newRefreshTokenHash = hashToken(newRefreshToken)

    let newToken;
    try {
      newToken = await prisma.$transaction(async (tx) => {
        const created = await tx.refreshTokens.create({
          data: {
            userId: existing.userId,
            tokenHash: newRefreshTokenHash,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
          }
        })

        const revoked = await tx.refreshTokens.updateMany({
          where: {
            id: existing.id,
            revokeAt: null,
          },
          data: {
            revokeAt: new Date(),
            replacedByTokenId: created.id
          }
        })

        if (revoked.count !== 1) {
          throw new Error("Refresh token already rotated")
        }

        return created
      })
    } catch (error) {
      await revokeAllActiveRefreshTokensForUser(existing.userId);
      throw error;
    }

    console.info(
      `[Token Rotation] userId=${existing.userId} oldTokenId=${existing.id} newTokenId=${newToken.id}`
    );

    await maybeCleanupRefreshTokens();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
