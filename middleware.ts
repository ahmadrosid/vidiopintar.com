// middleware.ts
export { default } from "next-auth/middleware"

// This function can be marked `async` if using `await` inside
// export function middleware(request: NextRequest) {
//   return NextResponse.redirect(new URL('/home', request.url))
// }

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/home/:path*', '/video/:path*'],
}
