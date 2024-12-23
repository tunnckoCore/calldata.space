import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const host = req.headers.get('host');
  const [one, two, three] = host?.split('.') || [];
  const chain = one === 'api' ? two : one;
  const api = one === 'api' ? 'api' : two;

  if (/mainnet|sepolia/.test(chain) && api === 'api') {
    const url = new URL(req.url);

    const newUrlPath = `/api-proxy/${chain}${url.pathname}${url.search || ''}`;
    const newUrl = new URL(newUrlPath, req.url);

    return NextResponse.rewrite(newUrl, { request: req });
  }

  return NextResponse.next();

  // return NextResponse.rewrite('/api/:path*', {});
}

export const config = {
  matcher: [
    /**
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
