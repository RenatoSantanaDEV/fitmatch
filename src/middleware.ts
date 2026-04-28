import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = new Set([
  '/',
  '/login',
  '/register',
  '/api/auth',
  '/api/users',
  '/api/professionals',
]);

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith('/api/auth/')) return true;
  if (pathname.startsWith('/api/register/')) return true;
  return false;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  if (!req.auth) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dest = `${req.nextUrl.pathname}${req.nextUrl.search}`;
    const safeDest = dest.startsWith('/') ? dest : '/matches';
    const home = new URL('/', req.url);
    home.searchParams.set('auth', 'login');
    home.searchParams.set('callbackUrl', safeDest);
    return NextResponse.redirect(home);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
