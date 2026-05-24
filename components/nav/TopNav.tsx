'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  HomeIcon, LibraryIcon, SessionsIcon, CombosIcon, LogOutIcon, BalisongLogo,
} from '@/components/icons';
import { StickyNote, BookOpen, Users, Heart } from 'lucide-react';
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
  { href: '/notes', label: 'Notes', icon: StickyNote },
];


export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

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

        <nav className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-thin">
          {NAV.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'inline-flex items-center gap-2 px-4 h-10 rounded-lg text-base font-medium whitespace-nowrap transition-colors',
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

        <ThemeToggle className="h-10 w-10" />

        {!user && (
          <Link
            href="/auth"
            className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-blade hover:bg-blade-soft text-white text-sm font-semibold shrink-0 transition-colors"
          >
            Sign in
          </Link>
        )}

        {user && (
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger
              className="grid place-items-center h-10 w-10 rounded-full bg-blade text-white text-sm font-bold shrink-0 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              aria-label="Account menu"
            >
              {user.email?.[0]?.toUpperCase() ?? '?'}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-64 p-1.5">
              <DropdownMenuLabel email={user.email ?? ''} />
              <DropdownMenuSeparator />
              {/* Site links — promoted with badge-styled icons + larger rows so
                  they don't get lost in the menu. */}
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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="gap-3 py-2 text-sm text-destructive"
              >
                <LogOutIcon className="h-3.5 w-3.5" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
