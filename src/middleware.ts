import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const [one, two] = host.split('.') || [];
  const chain = one === 'api' ? 'mainnet' : one;
  const sub = one === 'api' ? 'api' : one === 'wallet' ? 'wallet' : two;

  if (/mainnet|sepolia/.test(chain) && sub === 'api') {
    const url = new URL(req.url);

    const newUrlPath = `/ethscom-proxy/${chain}${url.pathname}${url.search || ''}`;
    const newUrl = new URL(newUrlPath, req.url);

    return NextResponse.rewrite(newUrl, { request: req });
  }

  if (sub === 'wallet') {
    const url = new URL(req.url);

    const x = one === 'wallet' ? '' : `/${one}`;
    const newUrlPath = `/wallet${x}${url.pathname}${url.search || ''}`;
    const newUrl = new URL(newUrlPath, req.url);

    return NextResponse.rewrite(newUrl, { request: req });
  }

  return NextResponse.next();
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
