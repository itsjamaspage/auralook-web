import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to handle CORS preflight (OPTIONS) requests for all routes.
 *
 * Telegram WebApp loads the Mini App in a sandboxed iframe that sends Origin: null.
 * The browser sends OPTIONS preflight before POST/GET with custom headers.
 * Without this middleware, Next.js returns 405 for OPTIONS on page routes,
 * which causes "does not have HTTP ok status" CORS errors for RSC prefetches.
 */
export function middleware(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Next-Router-State-Tree, Next-Router-Prefetch, RSC',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/(.*)',
};
