import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { otpResendSchema } from "@/lib/validation/authSchemas";
import { generateOTP, hashOTP } from "@/lib/otp";
import { sendSignupOTP } from "@/lib/email";
import { checkRateLimit } from "@/lib/rateLimit";

const RESEND_COOLDOWN_SECONDS = 60;
const MAX_RESEND_COUNT = 5;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";

    // Rate limit: Max 5 resend requests per 10 minutes per IP
    const rateLimitResult = await checkRateLimit(`otp_resend_ip:${ip}`, 5, 10 * 60);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many resend requests. Please wait before requesting another code." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = otpResendSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const { email } = validation.data;

    const pending = await prisma.pendingRegistration.findUnique({
      where: { email },
    });

    if (!pending) {
      return NextResponse.json(
        { error: "No pending signup found. Please complete the registration form." },
        { status: 400 }
      );
    }

    // Cooldown check (60 seconds)
    if (pending.lastResendAt) {
      const elapsedSeconds = (Date.now() - pending.lastResendAt.getTime()) / 1000;
      if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
        const remaining = Math.ceil(RESEND_COOLDOWN_SECONDS - elapsedSeconds);
        return NextResponse.json(
          { error: `Please wait ${remaining} seconds before requesting a new code.` },
          { status: 429 }
        );
      }
    }

    // Max resend count check
    if (pending.resendCount >= MAX_RESEND_COUNT) {
      return NextResponse.json(
        { error: "Maximum resend limit reached. Please restart registration." },
        { status: 429 }
      );
    }

    // Generate new OTP & hash
    const rawOtp = generateOTP();
    const otpHash = await hashOTP(rawOtp);
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Update pending record
    await prisma.pendingRegistration.update({
      where: { email },
      data: {
        otpHash,
        otpExpiresAt,
        otpAttempts: 0, // Reset attempts on fresh OTP
        resendCount: { increment: 1 },
        lastResendAt: new Date(),
      },
    });

    // Send email
    await sendSignupOTP(email, rawOtp);

    return NextResponse.json({
      success: true,
      message: "A new verification code has been sent to your email.",
    });
  } catch (error) {
    console.error("OTP resend error:", error);
    return NextResponse.json(
      { error: "Internal server error while resending verification code." },
      { status: 500 }
    );
  }
}
