import { createClient } from '@/lib/supabase/server';
import { ExternalIcon } from '@/components/icons';

interface CreatorRow {
  video_author: string;
  video_author_url: string | null;
}

interface CreatorAggregate {
  name: string;
  url: string | null;
  trickCount: number;
}

/** Aggregates distinct video authors from the tricks table — every channel
 *  we link to gets a row, with a count of tricks we reference from them. */
async function getCreators(): Promise<CreatorAggregate[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('tricks')
    .select('video_author, video_author_url')
    .not('video_author', 'is', null);

  const map = new Map<string, CreatorAggregate>();
  for (const row of (data ?? []) as CreatorRow[]) {
    if (!row.video_author) continue;
    const existing = map.get(row.video_author);
    if (existing) {
      existing.trickCount += 1;
      if (!existing.url && row.video_author_url) existing.url = row.video_author_url;
    } else {
      map.set(row.video_author, {
        name: row.video_author,
        url: row.video_author_url,
        trickCount: 1,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.trickCount - a.trickCount);
}

export default async function CreditsPage() {
  const creators = await getCreators();

  return (
    <div className="space-y-8 max-w-2xl">
      <header>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Credits</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-prose">
          Every reference video in Flip Tracker belongs to its original creator. Huge thanks to
          the people who took the time to break these tricks down — go subscribe.
        </p>
      </header>

      {creators.length === 0 ? (
        <div className="rounded-2xl bg-card ring-1 ring-border/40 px-6 py-12 text-center text-sm text-muted-foreground">
          No credits yet — once tricks have linked videos, contributors will show up here.
        </div>
      ) : (
        <ul className="space-y-3">
          {creators.map((c) => {
            const inner = (
              <>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.trickCount} {c.trickCount === 1 ? 'trick' : 'tricks'} referenced
                  </div>
                </div>
                {c.url && <ExternalIcon className="h-4 w-4 text-muted-foreground shrink-0" />}
              </>
            );
            return (
              <li key={c.name}>
                {c.url ? (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 rounded-2xl bg-card ring-1 ring-border/40 px-5 py-4 hover:bg-card/80 transition-colors"
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="flex items-center justify-between gap-4 rounded-2xl bg-card ring-1 ring-border/40 px-5 py-4">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
