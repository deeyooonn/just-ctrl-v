import { NextResponse } from 'next/server';

export function proxy(request) {
  if (process.env.NEXT_PUBLIC_PORTFOLIO_DEMO === 'false') return NextResponse.next();
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({error:'Service requests are disabled in the portfolio demo. Use the local study workspace.'}, {status:403});
  }
  return NextResponse.redirect(new URL('/demo', request.url));
}
export const config = { matcher: ['/', '/api/:path*', '/saves/:path*', '/account/:path*', '/upgrade/:path*', '/auth/:path*'] };
