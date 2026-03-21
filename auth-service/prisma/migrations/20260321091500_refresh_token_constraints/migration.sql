-- Add constraints and indexes for refresh token integrity and lookup performance
CREATE UNIQUE INDEX "RefreshTokens_tokenHash_key"
ON "RefreshTokens"("tokenHash");

CREATE UNIQUE INDEX "RefreshTokens_replacedByTokenId_key"
ON "RefreshTokens"("replacedByTokenId");

CREATE INDEX "RefreshTokens_userId_idx"
ON "RefreshTokens"("userId");

ALTER TABLE "RefreshTokens"
ADD CONSTRAINT "RefreshTokens_replacedByTokenId_fkey"
FOREIGN KEY ("replacedByTokenId") REFERENCES "RefreshTokens"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
