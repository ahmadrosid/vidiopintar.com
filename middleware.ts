import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Protected routes that require authentication
  const protectedPaths = [
    "/dashboard",
    "/profile",
    "/videos/create",
    "/notes",
    "/quizzes"
  ];
  
  const path = request.nextUrl.pathname;
  
  // Check if the current path is in the protected routes list
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path === protectedPath || path.startsWith(`${protectedPath}/`)
  );
  
  if (isProtectedPath) {
    const sessionCookie = getSessionCookie(request);
    
    if (!sessionCookie) {
      // Redirect to login if no session cookie is found
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  
  return NextResponse.next();
}

// Configure the matcher for the middleware
export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api/auth (Better Auth API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder files
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)"
  ],
};
