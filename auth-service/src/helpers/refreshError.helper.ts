export type RefreshErrorResponse = {
  status: number;
  code: string;
  message: string;
};

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

export function classifyRefreshError(error: unknown): RefreshErrorResponse {
  const message = toMessage(error);
  const normalized = message.toLowerCase();

  // Reuse detection
  if (normalized.includes("reused")) {
    return {
      status: 403,
      code: "token_reuse_detected",
      message: "Refresh token reuse detected - possible security breach",
    };
  }

  // Token expiry
  if (normalized.includes("expired")) {
    return {
      status: 401,
      code: "token_expired",
      message: "Refresh token has expired",
    };
  }

  // Token tampering/invalid signature
  if (
    normalized.includes("signature") ||
    normalized.includes("malformed") ||
    normalized.includes("tampered") ||
    normalized.includes("invalid token payload")
  ) {
    return {
      status: 401,
      code: "token_invalid",
      message: "Refresh token is invalid or has been tampered with",
    };
  }

  // Token not found in database
  if (normalized.includes("invalid refresh token")) {
    return {
      status: 401,
      code: "token_not_found",
      message: "Refresh token not found or invalid",
    };
  }

  // Generic server error
  return {
    status: 500,
    code: "refresh_error",
    message: "Failed to process refresh token",
  };
}
