import Link from 'next/link';
import {
  HomeIcon, LibraryIcon, SessionsIcon, CombosIcon, FlameIcon, SparkIcon, ClockIcon,
} from '@/components/icons';
import { StickyNote } from 'lucide-react';

interface Section {
  href: string;
  icon: typeof HomeIcon;
  title: string;
  body: string;
  link: string;
}

const SECTIONS: Section[] = [
  {
    href: '/tricks',
    icon: LibraryIcon,
    title: '1 — Browse the trick library',
    body: 'A curated catalog of balisong tricks across basic, twirl, fan, rollover, aerial, and flow. Each one has a reference video from creators like Big Flips, Squid Industries, Bali Tube, and more. Open any trick to watch the tutorial.',
    link: 'Open the library →',
  },
  {
    href: '/tricks',
    icon: SparkIcon,
    title: '2 — Mark what you can do',
    body: 'On a trick page, pick a status: Not started, Learning, Clean, or Mastered. The pill colors carry through the whole app so you can see progress at a glance. Add personal notes below if you want — cues, what felt off, what clicked.',
    link: 'Tag your first trick →',
  },
  {
    href: '/sessions/new',
    icon: SessionsIcon,
    title: '3 — Log a session after you flip',
    body: 'Three quick steps: how long, what you worked on (multi-select), anything worth remembering. The dashboard tallies your minutes + tricks practiced over time.',
    link: 'Log a session →',
  },
  {
    href: '/combos',
    icon: CombosIcon,
    title: '4 — String tricks into combos',
    body: 'Build named sequences of tricks for flow practice. Drag rows to reorder — same trick can appear twice if your combo loops. Useful for muscle-memory drills.',
    link: 'Make a combo →',
  },
  {
    href: '/notes',
    icon: StickyNote,
    title: '5 — Keep a flipping journal',
    body: 'Free-form notes — observations, drills you want to try, things you learned in a session that don\'t belong on a specific trick.',
    link: 'Write a note →',
  },
  {
    href: '/credits',
    icon: FlameIcon,
    title: 'Credit the creators',
    body: 'Every reference video belongs to its tutorial author. The Credits page lists every channel we link to with a direct link — go subscribe.',
    link: 'See credits →',
  },
];

export default function GuidePage() {
  return (
    <div className="space-y-10 max-w-3xl">
      <header>
        <div className="inline-flex items-center gap-2 rounded-full bg-blade/15 text-blade px-3 py-1 text-xs font-medium">
          <HomeIcon className="h-3.5 w-3.5" /> Getting started
        </div>
        <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">How Flip Tracker works</h1>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed max-w-prose">
          A focused tracker for balisong practice — what you can do, what you&apos;re working on,
          and how often you put time in. Five minutes here and you&apos;re set.
        </p>
      </header>

      <ol className="space-y-4">
        {SECTIONS.map(({ href, icon: Icon, title, body, link }, i) => (
          <li key={i}>
            <Link
              href={href}
              className="block rounded-2xl bg-card ring-1 ring-border/40 hover:ring-blade/40 p-6 transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-2 text-blade">
                <Icon className="h-4 w-4" />
                <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
              </div>
              <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{body}</p>
              <div className="mt-4 text-xs font-medium text-blade">{link}</div>
            </Link>
          </li>
        ))}
      </ol>

      <section className="rounded-2xl bg-card ring-1 ring-border/40 p-6 flex flex-col sm:flex-row items-start gap-4">
        <span className="grid place-items-center h-10 w-10 rounded-lg bg-blade text-white shrink-0">
          <ClockIcon className="h-5 w-5" />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold">Tip — be honest about your status</h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            &quot;Clean&quot; means you can land it most attempts, calmly, in any rotation direction.
            &quot;Mastered&quot; means under pressure — fast, drunk-with-flow, in a combo. Don&apos;t
            inflate; the % mastered on your dashboard is more motivating when it&apos;s real.
          </p>
        </div>
      </section>
    </div>
  );
}
