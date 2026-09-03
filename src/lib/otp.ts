import { randomInt } from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Generate a cryptographically secure 6-digit OTP.
 */
export function generateOTP(): string {
  // randomInt generates a value in [min, max) — so [100000, 1000000)
  return randomInt(100000, 1000000).toString();
}

/**
 * Hash an OTP using bcrypt before database storage.
 * Never store plaintext OTPs.
 */
export async function hashOTP(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

/**
 * Verify a plaintext OTP against its bcrypt hash.
 */
export async function verifyOTP(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}
