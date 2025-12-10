import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Specify protected and public routes
const publicRoutes = ["/login", "/logout"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some((path) => pathname.startsWith(path));

  // Get the authentication token from cookies
  const token = request.cookies.get("auth-token");

  // Redirect to /login if the user is not authenticated and accessing protected route
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect to /dashboard if the user is authenticated and accessing login page
  if (
    isPublicRoute &&
    token &&
    pathname === "/login" &&
    !pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Routes Proxy should not run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
};
