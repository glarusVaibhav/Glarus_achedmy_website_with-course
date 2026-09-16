import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validation/authSchemas";
import { generateOTP, hashOTP } from "@/lib/otp";
import { sendPasswordResetOTP } from "@/lib/email";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";

    // Rate limit: Max 5 requests per 15 minutes per IP
    const ipRateLimit = await checkRateLimit(`forgot_pwd_ip:${ip}`, 5, 15 * 60);
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many password reset requests. Please try again in ${ipRateLimit.retryAfterSeconds || 60} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Invalid email address";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email } = validation.data;

    // Rate limit per email: Max 3 requests per 10 minutes
    const emailRateLimit = await checkRateLimit(`forgot_pwd_email:${email}`, 3, 10 * 60);
    if (!emailRateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many requests for this email. Please wait ${emailRateLimit.retryAfterSeconds || 60} seconds.` },
        { status: 429 }
      );
    }

    // Check if user exists (generic response returned either way to prevent email enumeration)
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Generate secure 6-digit OTP & bcrypt hash
      const rawOtp = generateOTP();
      const otpHash = await hashOTP(rawOtp);
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

      // Store in PasswordResetRequest (upsert resets any existing pending request)
      await prisma.passwordResetRequest.upsert({
        where: { email },
        create: {
          userId: user.id,
          email,
          otpHash,
          otpExpiresAt,
          otpAttempts: 0,
          otpVerifiedAt: null,
          resetTokenHash: null,
          resetTokenExpiresAt: null,
          resetUsedAt: null,
          resendCount: 0,
          lastResendAt: new Date(),
        },
        update: {
          userId: user.id,
          otpHash,
          otpExpiresAt,
          otpAttempts: 0,
          otpVerifiedAt: null,
          resetTokenHash: null,
          resetTokenExpiresAt: null,
          resetUsedAt: null,
          resendCount: 0,
          lastResendAt: new Date(),
        },
      });

      // Send OTP email
      await sendPasswordResetOTP(email, rawOtp);
    }

    // Always return a generic response
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, we've sent a verification code.",
      email,
    });
  } catch (error) {
    console.error("Forgot password request error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
