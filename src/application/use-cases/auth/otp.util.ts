import * as crypto from 'crypto';

export const OTP_TTL_MINUTES = 5;

// Generates a 6-digit numeric OTP code, e.g. "042913".
export function generateOtpCode(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}
