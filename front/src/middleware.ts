import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/login",
  "/signup",
  "/_next",
  "/api/public",
  "/auth/google",
];

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export function middleware(req: NextRequest) {
  if (publicRoutes.some((p) => req.nextUrl.pathname.startsWith(p)))
    return NextResponse.next();
  const hasRefresh = !!req.cookies.get("refresh")?.value;
  if (!hasRefresh) return NextResponse.redirect(new URL("/login", req.url));
  return NextResponse.next();
}
