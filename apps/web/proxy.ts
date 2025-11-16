import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const PUBLIC_ROUTES = ["/", "/sign-in", "/sign-up"];

  // Protect dashboard routes
  if (!PUBLIC_ROUTES.includes(request.nextUrl.pathname)) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (
    sessionCookie &&
    (request.nextUrl.pathname === "/sign-in" ||
      request.nextUrl.pathname === "/sign-up")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}
export const config = {
  matcher: [
    "/ai/:path*",
    "/arcade/:path*",
    "/leaderboard",
    "/profile",
    "/admin/:path*",
    "/sign-in",
    "/sign-up",
  ], // Apply middleware to specific routes
};

// import { NextRequest, NextResponse } from "next/server";
// import { headers } from "next/headers";
// import { auth } from "@/lib/auth";
// export async function proxy(request: NextRequest) {
//   const PUBLIC_ROUTES = ["/", "/sign-in", "/sign-up"];
//   // const PRIVATE_ROUTES = [
//   //   "/admin",
//   //   "/profile",
//   //   "/arcade",
//   //   "/ai",
//   //   "/leaderboard",
//   // ];
//   const session = await auth.api.getSession({
//     headers: await headers(),
//   });
//   if (!PUBLIC_ROUTES.includes(request.nextUrl.pathname)) {
//     if (!session) {
//       return NextResponse.redirect(new URL("/sign-in", request.url));
//     }
//   }
//   if (
//     session &&
//     (request.nextUrl.pathname === "/sign-in" ||
//       request.nextUrl.pathname === "/sign-up")
//   ) {
//     return NextResponse.redirect(new URL("/", request.url));
//   }
//   return NextResponse.next();
// }
// export const config = {
//   matcher: [
//     "/ai/:path*",
//     "/arcade/:path*",
//     "/leaderboard",
//     "/profile",
//     "/admin/:path*",
//     "/sign-in",
//     "/sign-up",
//   ], // Apply middleware to specific routes
// };
