'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  HomeIcon, LibraryIcon, SessionsIcon, CombosIcon, LogOutIcon, MenuIcon, BalisongLogo,
} from '@/components/icons';
import { StickyNote, BookOpen, Compass, Users, Heart, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';

// Primary nav — user-data routes that need quick reach.
const NAV = [
  { href: '/', label: 'Dashboard', icon: HomeIcon },
  { href: '/tricks', label: 'Tricks', icon: LibraryIcon },
  { href: '/sessions', label: 'Sessions', icon: SessionsIcon },
  { href: '/combos', label: 'Combos', icon: CombosIcon },
];

const NAV_ITEM_CLASS = 'inline-flex items-center gap-2 px-4 h-10 rounded-lg text-base font-medium whitespace-nowrap transition-colors';
const NAV_GAP_PX = 4; // matches `gap-1` on the nav container


export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(NAV.length);
  const { resolvedTheme, setTheme } = useTheme();

  // Render nav items inline only while they fit; the rest slide into the
  // hamburger menu. Re-measures on container resize via ResizeObserver.
  useEffect(() => {
    const navEl = navRef.current;
    const measureEl = measureRef.current;
    if (!navEl || !measureEl) return;
    const measure = () => {
      const containerWidth = navEl.clientWidth;
      const itemEls = Array.from(measureEl.children) as HTMLElement[];
      let used = 0;
      let count = 0;
      for (const el of itemEls) {
        const next = used + (count > 0 ? NAV_GAP_PX : 0) + el.offsetWidth;
        if (next > containerWidth) break;
        used = next;
        count++;
      }
      setVisibleCount(count);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(navEl);
    return () => ro.disconnect();
  }, []);

  const overflowItems = NAV.slice(visibleCount);

  return (
    <header
      className="sticky top-0 z-30 w-full bg-sidebar/85 supports-[backdrop-filter]:bg-sidebar/70 backdrop-blur border-b border-sidebar-border"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="mx-auto w-full max-w-6xl flex items-center gap-4 px-4 md:px-6 h-17">
        <Link href="/" className="flex items-center gap-2.5 group shrink-0" aria-label="Flip Tracker home">
          <span className="grid place-items-center h-9 w-9 rounded-lg bg-blade text-white shadow-glow transition-transform group-hover:scale-105">
            <BalisongLogo className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline text-lg font-bold tracking-tight">Flip Tracker</span>
        </Link>

        <nav ref={navRef} className="flex-1 flex items-center gap-1 overflow-hidden">
          {NAV.slice(0, visibleCount).map(({ href, label, icon: Icon }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  NAV_ITEM_CLASS,
                  isActive
                    ? 'bg-blade text-white'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
                )}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Off-screen measurer — mirrors the inline item styles so widths match. */}
        <div
          ref={measureRef}
          aria-hidden
          className="absolute top-0 flex items-center gap-1 pointer-events-none"
          style={{ left: '-9999px' }}
        >
          {NAV.map(({ href, label, icon: Icon }) => (
            <span key={href} className={NAV_ITEM_CLASS}>
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span className="hidden md:inline">{label}</span>
            </span>
          ))}
        </div>

        <div className="hidden sm:block">
          <ThemeToggle className="h-10 w-10" />
        </div>

        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger
            className={cn(
              'relative grid place-items-center h-10 shrink-0 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
              user
                ? 'w-10 rounded-full bg-blade text-white text-sm font-bold'
                : 'w-10 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
            )}
            aria-label={
              overflowItems.length > 0
                ? `${user ? 'Account menu' : 'Menu'} — ${overflowItems.length} more`
                : user ? 'Account menu' : 'Menu'
            }
          >
            {user ? user.email?.[0]?.toUpperCase() ?? '?' : <MenuIcon className="h-5 w-5" />}
            {overflowItems.length > 0 && (
              <span
                aria-hidden
                className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 grid place-items-center rounded-full bg-blade text-white text-[10px] font-bold ring-2 ring-sidebar"
              >
                {overflowItems.length}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-64 p-1.5">
            {user && (
              <>
                <DropdownMenuLabel email={user.email ?? ''} />
                <DropdownMenuSeparator />
              </>
            )}
            {/* Primary nav items that couldn't fit inline — highlighted so
                they read as the "missing" nav at a glance. */}
            {overflowItems.length > 0 && (
              <>
                {overflowItems.map(({ href, label, icon: Icon }) => (
                  <DropdownMenuItem
                    key={href}
                    onClick={() => router.push(href)}
                    className="gap-3 py-2.5 text-sm font-medium bg-blade/10 text-blade focus:bg-blade/20 focus:text-blade"
                  >
                    <span className="grid place-items-center h-7 w-7 rounded-md bg-blade shrink-0">
                      <Icon className="h-3.5 w-3.5 text-white!" />
                    </span>
                    {label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            )}
            {/* Site links — promoted with badge-styled icons + larger rows so
                they don't get lost in the menu. */}
            <DropdownMenuItem
              onClick={() => router.push('/notes')}
              className="gap-3 py-2.5 text-sm font-medium"
            >
              <span className="grid place-items-center h-7 w-7 rounded-md bg-blade/15 text-blade shrink-0">
                <StickyNote className="h-3.5 w-3.5" />
              </span>
              Notes
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push('/guide')}
              className="gap-3 py-2.5 text-sm font-medium"
            >
              <span className="grid place-items-center h-7 w-7 rounded-md bg-blade/15 text-blade shrink-0">
                <BookOpen className="h-3.5 w-3.5" />
              </span>
              How it works
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push('/balisong-guide')}
              className="gap-3 py-2.5 text-sm font-medium"
            >
              <span className="grid place-items-center h-7 w-7 rounded-md bg-blade/15 text-blade shrink-0">
                <Compass className="h-3.5 w-3.5" />
              </span>
              Balisong guide
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push('/credits')}
              className="gap-3 py-2.5 text-sm font-medium"
            >
              <span className="grid place-items-center h-7 w-7 rounded-md bg-blade/15 text-blade shrink-0">
                <Users className="h-3.5 w-3.5" />
              </span>
              Credits
            </DropdownMenuItem>
            {/* Donate row — accented with a red heart + small chip, no
                background flood so it reads as a quiet CTA in the menu. */}
            <DropdownMenuItem
              onClick={() => router.push('/donate')}
              className="gap-3 py-2.5 text-sm font-medium"
            >
              <span className="grid place-items-center h-7 w-7 rounded-md bg-blade/15 text-blade shrink-0">
                <Heart className="h-3.5 w-3.5 fill-current animate-pulse" />
              </span>
              <span className="flex-1 text-left">Support the project</span>
              <span className="text-[10px] uppercase tracking-widest text-blade font-semibold">Donate</span>
            </DropdownMenuItem>
            {/* Theme toggle — only in the menu on small screens; lives in the
                header at sm+. */}
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
              }}
              className="sm:hidden gap-3 py-2.5 text-sm font-medium"
            >
              <span className="grid place-items-center h-7 w-7 rounded-md bg-blade/15 text-blade shrink-0">
                <Sun className="h-3.5 w-3.5 hidden dark:block" />
                <Moon className="h-3.5 w-3.5 block dark:hidden" />
              </span>
              <span className="flex-1 text-left">Theme</span>
              {resolvedTheme && (
                <span className="text-xs text-muted-foreground capitalize">{resolvedTheme}</span>
              )}
            </DropdownMenuItem>
            {user && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="gap-3 py-2 text-sm text-destructive"
                >
                  <LogOutIcon className="h-3.5 w-3.5" /> Sign out
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {!user && (
          <Link
            href="/auth"
            className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-blade hover:bg-blade-soft text-white text-sm font-semibold shrink-0 transition-colors"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}

function DropdownMenuLabel({ email }: { email: string }): ReactNode {
  return (
    <div className="px-2 py-1.5 text-xs">
      <div className="text-muted-foreground">Signed in as</div>
      <div className="truncate font-medium text-foreground" title={email}>{email}</div>
    </div>
  );
}
