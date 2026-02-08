import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
// A simple client-side check is usually done in the components or by checking for cookies.
// Since we are storing token in localStorage, we can't fully protect routes in Middleware (server-side).
// But we can check for a cookie if we moved to cookie-based auth.
// For now, we'll let the client-side wrappers handle redirects, or implement a "AuthGuard" layout.
// However, typically we want to redirect / to /login if not authenticated.
// We can't see localStorage here.
// So we will rely on client-side protection for now.

return NextResponse.next()
}

export const config = {
matcher: [
/*
* Match all request paths except for the ones starting with:
* - api (API routes)
* - _next/static (static files)
* - _next/image (image optimization files)
* - favicon.ico (favicon file)
* - login (login page)
*/
'/((?!api|_next/static|_next/image|favicon.ico|login).*)',
],
}
