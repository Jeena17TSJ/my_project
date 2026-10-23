import { NextRequest, NextResponse } from 'next/server';

const authCookieNames = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
  'next-auth.callback-url',
  '__Secure-next-auth.callback-url',
  'next-auth.csrf-token',
  '__Host-next-auth.csrf-token',
];

export async function GET(req: NextRequest) {
  const callbackUrl = req.nextUrl.searchParams.get('callbackUrl') || '/';
  const redirectUrl = new URL(callbackUrl, req.url);
  const response = NextResponse.redirect(redirectUrl);

  authCookieNames.forEach(name => {
    response.cookies.set(name, '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });
  });

  return response;
}
