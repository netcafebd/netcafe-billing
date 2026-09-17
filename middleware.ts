import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "isp_session";
const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "default-fallback-super-secret-key-at-least-32-chars-long"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  let session: { userId: string; email: string; role: "ADMIN" | "CUSTOMER"; customerId?: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY, {
        algorithms: ["HS256"],
      });
      session = payload as any;
    } catch {
      // Invalid/expired token
    }
  }

  // 1. If accessing Login page
  if (pathname.startsWith("/login")) {
    if (session) {
      if (session.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } else {
        return NextResponse.redirect(new URL("/portal/dashboard", request.url));
      }
    }
    return NextResponse.next();
  }

  // 2. Admin routes protection
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/portal/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 3. Customer portal routes protection
  if (pathname.startsWith("/portal")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "CUSTOMER" || !session.customerId) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*", "/login"],
};

