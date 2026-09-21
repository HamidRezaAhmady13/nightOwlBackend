import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Normalize percent-encoded characters to uppercase
  if (url.pathname.includes("%")) {
    url.pathname = url.pathname.replace(/%[a-f0-9]{2}/gi, (m) =>
      m.toUpperCase(),
    );
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/post/:path*"],
};
