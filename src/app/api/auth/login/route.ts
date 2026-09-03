import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { setSession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";

    // Rate limit login: Max 10 attempts per 5 minutes per IP
    const rateLimit = await checkRateLimit(`login_ip:${ip}`, 10, 5 * 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${rateLimit.retryAfterSeconds || 60} seconds.` },
        { status: 429 }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (user.status === "BLOCKED") {
      return NextResponse.json(
        { error: "This account has been suspended. Please contact support." },
        { status: 403 }
      );
    }

    // If user signed up via Google with no password set
    if (!user.password && user.authProvider === "GOOGLE") {
      return NextResponse.json(
        { error: "This account is linked with Google. Please use Continue with Google to sign in." },
        { status: 400 }
      );
    }

    if (!user.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Set JWT secure cookie session
    await setSession({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Provide redirection hints to client depending on role
    let redirectUrl = "/dashboard";
    if (user.role === "INSTRUCTOR") redirectUrl = "/instructor";
    if (user.role === "ADMIN") redirectUrl = "/admin";

    return NextResponse.json({ success: true, redirectUrl });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

