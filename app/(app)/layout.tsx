import type { ReactNode } from 'react';
import { TopNav } from '@/components/nav/TopNav';

export default function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 px-4 md:px-6 py-8 md:py-10">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
