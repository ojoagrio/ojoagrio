import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export default auth((req) => {
  if (!req.auth) {
    // `nextUrl.pathname` is basePath-stripped by Next, so this matches the
    // page even though the browser is actually at /agriolinks/dashboard.
    const loginUrl = new URL('/agriolinks/login', req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
  // auth.ts pulls in bcryptjs + jose, both Node-only — run on the Node.js
  // runtime (Fluid Compute) instead of Edge to avoid the missing-API warnings.
  runtime: 'nodejs',
};
