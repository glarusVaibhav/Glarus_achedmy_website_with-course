import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { signupSchema } from "@/lib/validation/authSchemas";
import { generateOTP, hashOTP } from "@/lib/otp";
import { sendSignupOTP } from "@/lib/email";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    
    // Rate limit: Max 5 registration attempts per 15 minutes per IP
    const rateLimitResult = await checkRateLimit(`signup_ip:${ip}`, 5, 15 * 60);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: `Too many registration attempts. Please try again in ${rateLimitResult.retryAfterSeconds || 60} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Invalid registration data";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, email, password, role = "STUDENT" } = validation.data;

    // Check if email already belongs to an existing User
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "This email is already registered. Please log in instead." },
        { status: 409 }
      );
    }

    // Rate limit OTP generation per email: Max 3 requests per 10 minutes
    const emailRateLimit = await checkRateLimit(`otp_send_email:${email}`, 3, 10 * 60);
    if (!emailRateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many requests for this email. Please wait ${emailRateLimit.retryAfterSeconds || 60} seconds.` },
        { status: 429 }
      );
    }

    // Hash password & OTP
    const passwordHash = await bcrypt.hash(password, 10);
    const rawOtp = generateOTP();
    const otpHash = await hashOTP(rawOtp);
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    // Store in PendingRegistration (upsert replaces any existing pending request)
    await prisma.pendingRegistration.upsert({
      where: { email },
      create: {
        email,
        name,
        passwordHash,
        otpHash,
        otpExpiresAt,
        otpAttempts: 0,
        resendCount: 0,
        lastResendAt: new Date(),
        role: role as any,
      },
      update: {
        name,
        passwordHash,
        otpHash,
        otpExpiresAt,
        otpAttempts: 0,
        resendCount: 0,
        lastResendAt: new Date(),
        role: role as any,
      },
    });

    // Send verification email
    await sendSignupOTP(email, rawOtp);

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email.",
      email,
    });
  } catch (error) {
    console.error("Signup registration error:", error);
    return NextResponse.json({ error: "Internal server error. Please try again later." }, { status: 500 });
  }
}

