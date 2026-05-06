import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { setSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
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
