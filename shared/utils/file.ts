import { readFileSync } from "fs";

export function readUtf8File(filePath: string): string {
  return readFileSync(filePath, "utf8");
}
