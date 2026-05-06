import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'glarus-academy-super-secret-key-for-jwt-2024'
);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;

  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
  const isInstructorRoute = req.nextUrl.pathname.startsWith('/instructor');
  const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard');

  if (!isAdminRoute && !isInstructorRoute && !isDashboardRoute) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const { payload } = await jose.jwtVerify(token, secret);

    if (isAdminRoute && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (isInstructorRoute && payload.role !== 'INSTRUCTOR' && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  } catch (error) {
    req.cookies.delete('auth_token');
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/instructor/:path*', '/dashboard/:path*'],
};
