import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";

function getBaseUrl(req: Request): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  const cleanHost = host.replace("0.0.0.0", "localhost");
  const proto = req.headers.get("x-forwarded-proto") || (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${proto}://${cleanHost}`;
}

export async function GET(req: Request) {
  const baseUrl = getBaseUrl(req);
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/auth/google/callback`;

  if (!clientId || clientId.trim() === "") {
    // Return friendly query error if client credentials are not yet configured in .env
    const url = new URL(req.url);
    const returnPath = url.searchParams.get("from") === "login" ? "/login" : "/signup";
    const errorMessage = encodeURIComponent(
      "Google OAuth is not configured yet. Please provide GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file."
    );
    return NextResponse.redirect(`${baseUrl}${returnPath}?error=${errorMessage}`);
  }

  // Generate cryptographic state for CSRF protection
  const state = randomBytes(32).toString("hex");

  const cookieStore = await cookies();
  cookieStore.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60, // 10 minutes
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state: state,
    access_type: "offline",
    prompt: "select_account",
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return NextResponse.redirect(googleAuthUrl);
}

