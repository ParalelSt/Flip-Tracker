import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export default async function proxy(req: NextRequest) {
  const response = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Swallow transient Supabase fetch failures — undici keep-alive can briefly
  // get stuck after a network blip. Treat as "no user" so the page still
  // renders (private routes redirect to /auth, public ones pass through).
  let user: { id: string } | null = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user ?? null;
  } catch {
    user = null;
  }
  // Guest mode is allowed everywhere — every app page works without auth via
  // localStorage. The only redirect we still do is sending an already-signed-in
  // user away from /auth so they don't see the form on top of their account.
  const path = req.nextUrl.pathname;
  if (user && path === '/auth') {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|webmanifest)$).*)'],
};
