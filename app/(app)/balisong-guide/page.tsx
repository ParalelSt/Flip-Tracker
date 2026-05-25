import { Compass, ExternalLink } from 'lucide-react';

interface Resource {
  href: string;
  title: string;
  source: string;
  body: string;
}

const RESOURCES: Resource[] = [
  {
    href: 'https://www.reddit.com/r/balisong/comments/x3bvj6/balisong_guide_2022_and_onward/',
    title: 'Balisong guide 2022 and onward',
    source: 'r/balisong',
    body: 'Community-maintained guide covering trainers vs. live blades, recommended starter knives, learning paths, and where to find tutorials. Good first read if you\'re picking up the hobby.',
  },
];

export default function BalisongGuidePage() {
  return (
    <div className="space-y-10 max-w-3xl">
      <header>
        <div className="inline-flex items-center gap-2 rounded-full bg-blade/15 text-blade px-3 py-1 text-xs font-medium">
          <Compass className="h-3.5 w-3.5" /> External resources
        </div>
        <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">Balisong guide</h1>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed max-w-prose">
          Hand-picked reading from outside Flip Tracker — primers, gear advice, and learning paths
          from the wider balisong community.
        </p>
      </header>

      <ul className="space-y-4">
        {RESOURCES.map(({ href, title, source, body }) => (
          <li key={href}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl bg-card ring-1 ring-border/40 hover:ring-blade/40 p-6 transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-blade min-w-0">
                  <Compass className="h-4 w-4 shrink-0" />
                  <h2 className="text-lg font-semibold tracking-tight truncate">{title}</h2>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
              <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{source}</div>
              <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{body}</p>
              <div className="mt-4 text-xs font-medium text-blade">Open on Reddit →</div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
