import bcrypt from "bcrypt";
import {
  AuthPayload,
  RefreshRequest,
  RegisterRequest,
  TokenPayload,
  TokenService,
  VerifyRequest,
} from "@shared/types/auth";
import { prisma } from "../lib/prisma";
import { isNonEmptyString } from "../helpers/string.helper";

const BCRYPT_SALT_ROUNDS = 10;

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

    return { accessToken, refreshToken };
  }

  async login() {
    const payload: AuthPayload = {
      sub: 1,
      email: "test@example.com",
    };

    const accessToken = await this.tokenService.generateAccessToken(payload);
    const refreshToken = await this.tokenService.generateRefreshToken(payload);

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

    const payload: TokenPayload = await this.tokenService.verifyRefreshToken(refreshToken);
    const { sub, email } = payload;

    const newAccessToken = await this.tokenService.generateAccessToken({ sub, email });

    return { accessToken: newAccessToken };
  }
}
