import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { resendResetOtpSchema } from "@/lib/validation/authSchemas";
import { generateOTP, hashOTP } from "@/lib/otp";
import { sendPasswordResetOTP } from "@/lib/email";
import { checkRateLimit } from "@/lib/rateLimit";

const RESEND_COOLDOWN_SECONDS = 30;
const MAX_RESEND_COUNT = 5;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";

    // Rate limit: Max 5 resend requests per 10 minutes per IP
    const rateLimitResult = await checkRateLimit(`forgot_resend_ip:${ip}`, 5, 10 * 60);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many resend requests. Please wait before requesting another code." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = resendResetOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const { email } = validation.data;

    const resetRequest = await prisma.passwordResetRequest.findUnique({
      where: { email },
    });

    if (!resetRequest) {
      return NextResponse.json(
        { error: "No active password reset request found. Please restart from the Forgot Password page." },
        { status: 400 }
      );
    }

    // Cooldown check (30 seconds)
    if (resetRequest.lastResendAt) {
      const elapsedSeconds = (Date.now() - resetRequest.lastResendAt.getTime()) / 1000;
      if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
        const remaining = Math.ceil(RESEND_COOLDOWN_SECONDS - elapsedSeconds);
        return NextResponse.json(
          { error: `Please wait ${remaining} seconds before requesting a new code.` },
          { status: 429 }
        );
      }
    }

    // Max resend count check
    if (resetRequest.resendCount >= MAX_RESEND_COUNT) {
      return NextResponse.json(
        { error: "Maximum resend limit reached. Please start a new password reset request." },
        { status: 429 }
      );
    }

    // Generate fresh 6-digit OTP & bcrypt hash
    const rawOtp = generateOTP();
    const otpHash = await hashOTP(rawOtp);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

    // Update reset request record (invalidates previous OTP & reset token)
    await prisma.passwordResetRequest.update({
      where: { email },
      data: {
        otpHash,
        otpExpiresAt,
        otpAttempts: 0,
        otpVerifiedAt: null,
        resetTokenHash: null,
        resetTokenExpiresAt: null,
        resendCount: { increment: 1 },
        lastResendAt: new Date(),
      },
    });

    // Send email
    await sendPasswordResetOTP(email, rawOtp);

    return NextResponse.json({
      success: true,
      message: "A new verification code has been sent to your email.",
    });
  } catch (error) {
    console.error("Forgot password OTP resend error:", error);
    return NextResponse.json(
      { error: "Internal server error while resending verification code." },
      { status: 500 }
    );
  }
}
