import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { resetPasswordSchema } from "@/lib/validation/authSchemas";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";

    // Rate limit: Max 5 password reset attempts per 15 minutes per IP
    const rateLimitResult = await checkRateLimit(`reset_pwd_ip:${ip}`, 5, 15 * 60);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many password reset attempts. Please wait before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email, resetToken, password } = validation.data;

    // Locate the password reset request
    const resetRequest = await prisma.passwordResetRequest.findUnique({
      where: { email },
    });

    if (!resetRequest) {
      return NextResponse.json(
        { error: "No active password reset request found. Please restart the process." },
        { status: 400 }
      );
    }

    // Verify OTP was validated
    if (!resetRequest.otpVerifiedAt) {
      return NextResponse.json(
        { error: "Email OTP verification required before resetting password." },
        { status: 403 }
      );
    }

    // Verify reset token authorization
    if (!resetRequest.resetTokenHash || !resetRequest.resetTokenExpiresAt) {
      return NextResponse.json(
        { error: "Invalid password reset authorization. Please verify your OTP again." },
        { status: 403 }
      );
    }

    // Check token expiration
    if (new Date() > resetRequest.resetTokenExpiresAt) {
      return NextResponse.json(
        { error: "Password reset authorization has expired. Please restart the process." },
        { status: 400 }
      );
    }

    // Check if already used
    if (resetRequest.resetUsedAt) {
      return NextResponse.json(
        { error: "This password reset authorization has already been used." },
        { status: 400 }
      );
    }

    // Verify token hash
    const submittedTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    if (submittedTokenHash !== resetRequest.resetTokenHash) {
      return NextResponse.json(
        { error: "Invalid or tampered password reset authorization." },
        { status: 403 }
      );
    }

    // Locate associated user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    // Hash new password using bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user password & mark/remove reset request
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: passwordHash },
      }),
      prisma.passwordResetRequest.delete({
        where: { email },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Your password has been updated successfully. You can now sign in with your new password.",
    });
  } catch (error) {
    console.error("Password reset execution error:", error);
    return NextResponse.json(
      { error: "Internal server error while updating password." },
      { status: 500 }
    );
  }
}
