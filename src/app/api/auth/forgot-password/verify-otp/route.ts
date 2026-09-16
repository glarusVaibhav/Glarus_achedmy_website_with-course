import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db";
import { verifyResetOtpSchema } from "@/lib/validation/authSchemas";
import { verifyOTP } from "@/lib/otp";
import { checkRateLimit } from "@/lib/rateLimit";

const MAX_OTP_ATTEMPTS = 5;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";

    // Rate limit: Max 10 verification requests per 5 minutes per IP
    const rateLimitResult = await checkRateLimit(`forgot_verify_ip:${ip}`, 10, 5 * 60);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many verification attempts. Please wait before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = verifyResetOtpSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email, otp } = validation.data;

    // Locate the password reset request
    const resetRequest = await prisma.passwordResetRequest.findUnique({
      where: { email },
    });

    if (!resetRequest) {
      return NextResponse.json(
        { error: "No password reset request found for this email. Please request a new code." },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date() > resetRequest.otpExpiresAt) {
      return NextResponse.json(
        { error: "This verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check maximum attempts
    if (resetRequest.otpAttempts >= MAX_OTP_ATTEMPTS) {
      return NextResponse.json(
        { error: "Maximum verification attempts exceeded. Please request a new code." },
        { status: 400 }
      );
    }

    // Verify OTP against hash
    const isValid = await verifyOTP(otp, resetRequest.otpHash);

    if (!isValid) {
      const updatedAttempts = resetRequest.otpAttempts + 1;
      const isLockedOut = updatedAttempts >= MAX_OTP_ATTEMPTS;

      await prisma.passwordResetRequest.update({
        where: { email },
        data: {
          otpAttempts: updatedAttempts,
          ...(isLockedOut ? { otpExpiresAt: new Date(0) } : {}), // Invalidate on lockout
        },
      });

      if (isLockedOut) {
        return NextResponse.json(
          { error: "Too many incorrect attempts. This code has been invalidated. Please request a new code." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: `Invalid verification code. ${MAX_OTP_ATTEMPTS - updatedAttempts} attempt(s) remaining.` },
        { status: 400 }
      );
    }

    // Generate secure random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    const resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    // Mark OTP verified & save reset token authorization
    await prisma.passwordResetRequest.update({
      where: { email },
      data: {
        otpVerifiedAt: new Date(),
        resetTokenHash,
        resetTokenExpiresAt,
        otpAttempts: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: "OTP successfully verified.",
      resetToken,
    });
  } catch (error) {
    console.error("Forgot password OTP verify error:", error);
    return NextResponse.json(
      { error: "Internal server error during verification." },
      { status: 500 }
    );
  }
}
