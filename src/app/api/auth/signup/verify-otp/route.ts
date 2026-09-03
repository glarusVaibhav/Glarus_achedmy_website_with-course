import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { otpVerifySchema } from "@/lib/validation/authSchemas";
import { verifyOTP } from "@/lib/otp";
import { setSession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";

    // Rate limit: Max 10 OTP verification calls per 5 minutes per IP
    const rateLimitResult = await checkRateLimit(`otp_verify_ip:${ip}`, 10, 5 * 60);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many verification attempts. Please wait before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = otpVerifySchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email, otp } = validation.data;

    // Find pending registration record
    const pending = await prisma.pendingRegistration.findUnique({
      where: { email },
    });

    if (!pending) {
      return NextResponse.json(
        { error: "No pending signup found for this email. Please submit the signup form." },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date() > pending.otpExpiresAt) {
      return NextResponse.json(
        { error: "This verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check max attempts (5 maximum)
    if (pending.otpAttempts >= 5) {
      return NextResponse.json(
        { error: "Maximum verification attempts exceeded. Please request a new code." },
        { status: 400 }
      );
    }

    // Verify OTP hash
    const isValid = await verifyOTP(otp, pending.otpHash);

    if (!isValid) {
      const updatedAttempts = pending.otpAttempts + 1;
      await prisma.pendingRegistration.update({
        where: { email },
        data: { otpAttempts: updatedAttempts },
      });

      if (updatedAttempts >= 5) {
        return NextResponse.json(
          { error: "Too many incorrect attempts. Please request a new verification code." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: `Invalid verification code. ${5 - updatedAttempts} attempt(s) remaining.` },
        { status: 400 }
      );
    }

    // Verify double-check: ensure user doesn't already exist
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      await prisma.pendingRegistration.delete({ where: { email } }).catch(() => {});
      return NextResponse.json(
        { error: "This email is already registered. Please log in." },
        { status: 409 }
      );
    }

    const userRole = pending.role || "STUDENT";

    // Create the verified active User account
    const newUser = await prisma.user.create({
      data: {
        name: pending.name,
        email: pending.email,
        password: pending.passwordHash,
        role: userRole,
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
        authProvider: "EMAIL",
        ...(userRole === "INSTRUCTOR"
          ? {
              instructorProfile: {
                create: {
                  totalRevenue: 0.0,
                  rating: 5.0,
                  totalStudents: 0,
                },
              },
            }
          : {}),
      },
    });

    // Delete pending record
    await prisma.pendingRegistration.delete({ where: { email } }).catch(() => {});

    // Create authenticated session
    await setSession({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    const targetRedirect = newUser.role === "INSTRUCTOR" ? "/instructor" : "/dashboard";

    return NextResponse.json({
      success: true,
      message: "Account created and verified successfully!",
      redirectUrl: targetRedirect,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "Internal server error during verification." },
      { status: 500 }
    );
  }
}
