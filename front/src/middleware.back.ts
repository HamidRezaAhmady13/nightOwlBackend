// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
//   const url = request.nextUrl.clone();

//   if (url.pathname.includes("%")) {
//     const normalized = url.pathname.replace(/%[0-9a-f]{2}/gi, (m) =>
//       m.toUpperCase(),
//     );
//     if (normalized !== url.pathname) {
//       url.pathname = normalized;
//       return NextResponse.rewrite(url);
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: "/(.*)",
// };
