import Link from 'next/link';
import { ExternalIcon, FlameIcon, SparkIcon } from '@/components/icons';

const LINKS = [
  { label: 'Buy me a coffee', url: 'https://buymeacoffee.com/strixparal7', note: 'One-tap tip — every bit helps.' },
  { label: 'PayPal', url: 'https://paypal.me/AronM2005', note: 'Direct one-off donation, any amount.' },
  { label: 'Follow on GitHub', url: 'https://github.com/ParalelSt', note: 'Star or follow the project — free, but goes a long way.' },
];

export default function DonatePage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <header>
        <div className="inline-flex items-center gap-2 rounded-full bg-blade/15 text-blade px-3 py-1 text-xs font-medium">
          <SparkIcon className="h-3.5 w-3.5" /> Support the project
        </div>
        <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">Donate</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-prose">
          Flip Tracker is free and open. If it&apos;s helping your practice, you can chip in to
          keep it ad-free and the seed library growing. No pressure — sharing the app with
          another flipper helps just as much.
        </p>
      </header>

      <ul className="space-y-3">
        {LINKS.map((l) => (
          <li key={l.label}>
            <a
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-4 rounded-2xl bg-card ring-1 ring-border/40 px-5 py-4 hover:bg-card/80 transition-colors"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold">{l.label}</div>
                <div className="text-xs text-muted-foreground">{l.note}</div>
              </div>
              <ExternalIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            </a>
          </li>
        ))}
      </ul>

      <div className="rounded-2xl bg-card ring-1 ring-border/40 px-5 py-4 text-sm text-muted-foreground flex items-start gap-3">
        <FlameIcon className="h-4 w-4 text-blade shrink-0 mt-0.5" />
        <p>
          Tutorial creators do the real work. Check{' '}
          <Link href="/credits" className="text-foreground hover:underline">Credits</Link>{' '}
          and support them on YouTube too — a like + subscribe goes a long way.
        </p>
      </div>
    </div>
  );
}
