import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { setSession } from "@/lib/auth";

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
}

function getBaseUrl(req: Request): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  const cleanHost = host.replace("0.0.0.0", "localhost");
  const proto = req.headers.get("x-forwarded-proto") || (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${proto}://${cleanHost}`;
}

export async function GET(req: Request) {
  const baseUrl = getBaseUrl(req);
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${baseUrl}/signup?error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/signup?error=Missing%20authorization%20code%20or%20state`);
  }

  // Validate state against cookie to prevent CSRF
  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;
  cookieStore.delete("oauth_state");

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      `${baseUrl}/signup?error=${encodeURIComponent("Authentication failed due to state mismatch. Please try again.")}`
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${baseUrl}/signup?error=${encodeURIComponent("Google OAuth is not configured on the server")}`
    );
  }

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Google token exchange error:", tokenData);
      return NextResponse.redirect(
        `${baseUrl}/signup?error=${encodeURIComponent("Failed to exchange authorization token with Google")}`
      );
    }

    // Retrieve trusted user profile from Google
    const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userInfo: GoogleUserInfo = await userinfoResponse.json();

    if (!userinfoResponse.ok || !userInfo.email) {
      return NextResponse.redirect(
        `${baseUrl}/signup?error=${encodeURIComponent("Failed to retrieve user profile from Google")}`
      );
    }

    if (!userInfo.email_verified) {
      return NextResponse.redirect(
        `${baseUrl}/signup?error=${encodeURIComponent("Your Google email is unverified. Please verify your email on Google first.")}`
      );
    }

    const email = userInfo.email.toLowerCase().trim();
    const googleId = userInfo.sub;
    const name = userInfo.name || email.split("@")[0];

    // Check account status in DB
    // Case 1: User exists with this googleId
    let user = await prisma.user.findUnique({
      where: { googleId },
    });

    if (user) {
      // Existing Google user -> Log in
      await setSession({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      let target = "/dashboard";
      if (user.role === "INSTRUCTOR") target = "/instructor";
      if (user.role === "ADMIN") target = "/admin";
      return NextResponse.redirect(`${baseUrl}${target}`);
    }

    // Case 2: User exists with this email
    const existingByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingByEmail) {
      if (existingByEmail.authProvider === "EMAIL" && existingByEmail.password) {
        // Safe rejection for account linking
        return NextResponse.redirect(
          `${baseUrl}/login?error=${encodeURIComponent(
            "This email is registered with a password. Please sign in using your password."
          )}`
        );
      }

      // Link googleId if already a Google account without linked googleId
      user = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: { googleId, authProvider: "GOOGLE" },
      });

      await setSession({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      let target = "/dashboard";
      if (user.role === "INSTRUCTOR") target = "/instructor";
      if (user.role === "ADMIN") target = "/admin";
      return NextResponse.redirect(`${baseUrl}${target}`);
    }

    // Case 3: New User Registration via Google (Role is STRICTLY STUDENT)
    user = await prisma.user.create({
      data: {
        name,
        email,
        password: null,
        role: "STUDENT",
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
        authProvider: "GOOGLE",
        googleId,
      },
    });

    await setSession({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return NextResponse.redirect(`${baseUrl}/dashboard`);
  } catch (err) {
    console.error("Google OAuth callback exception:", err);
    return NextResponse.redirect(
      `${baseUrl}/signup?error=${encodeURIComponent("Internal authentication error. Please try again.")}`
    );
  }
}

