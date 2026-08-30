import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseConfig } from '@/lib/supabase/config';
import type { Database } from '@/lib/supabase/types';

const PUBLIC_ROUTE_PREFIXES = ['/', '/onboarding', '/login', '/signup', '/auth/callback', '/auth/confirm', '/privacy'];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;

  if (
    (searchParams.has('code') || searchParams.has('token_hash') || searchParams.has('token')) &&
    !pathname.startsWith('/auth/')
  ) {
    const callbackUrl = new URL('/auth/callback', request.url);
    callbackUrl.search = searchParams.toString();
    return NextResponse.redirect(callbackUrl);
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseConfig();
  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Keep auth.getClaims() immediately after client creation so cookie refresh works correctly.
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims.sub);

  const isPublicRoute = PUBLIC_ROUTE_PREFIXES.some((route) =>
    route === '/' ? pathname === route : pathname.startsWith(route),
  );

  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthenticated && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
