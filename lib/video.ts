/** Extract a YouTube video ID from any common URL shape, or return null.
 *  Supports youtu.be, watch?v=, /embed/, /shorts/. */
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') return u.pathname.slice(1).split('/')[0] || null;
    if (host.endsWith('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return v;
      const parts = u.pathname.split('/').filter(Boolean);
      const i = parts.findIndex((p) => p === 'embed' || p === 'shorts');
      if (i !== -1 && parts[i + 1]) return parts[i + 1];
    }
    return null;
  } catch {
    return null;
  }
}

/** YouTube's CDN-served thumbnail for a video ID. `hqdefault.jpg` always
 *  exists; `maxresdefault` doesn't for every video. */
export function youtubeThumbnail(videoId: string | null): string | null {
  if (!videoId) return null;
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

/** One-shot helper: URL → thumbnail (null if not YouTube). */
export function thumbnailFromUrl(url: string | null | undefined): string | null {
  return youtubeThumbnail(youtubeId(url ?? null));
}

/** What oEmbed gives us for any supported provider (YouTube, Vimeo, …). */
export interface OembedMetadata {
  title: string | null;
  author: string | null;
  authorUrl: string | null;
  thumbnailUrl: string | null;
}

/** Pick the right oEmbed endpoint for a URL. Returns null if the host isn't
 *  a known oEmbed provider — caller should treat that as "no metadata". */
function oembedEndpoint(url: string): string | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (host === 'youtu.be' || host.endsWith('youtube.com')) {
      return `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`;
    }
    if (host.endsWith('vimeo.com')) {
      return `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;
    }
    return null;
  } catch {
    return null;
  }
}

/** Fetches oEmbed metadata for a video URL. Server-side: providers gate by
 *  Referer for cross-origin browser calls. Times out fast so a slow provider
 *  doesn't block a trick insert. Returns null on any failure. */
export async function fetchVideoMetadata(url: string | null | undefined): Promise<OembedMetadata | null> {
  if (!url) return null;
  const endpoint = oembedEndpoint(url);
  if (!endpoint) return null;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(endpoint, {
      headers: { 'User-Agent': 'flip-tracker/1.0' },
      signal: ctrl.signal,
      cache: 'no-store',
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<{
      title: string;
      author_name: string;
      author_url: string;
      thumbnail_url: string;
    }>;
    return {
      title: data.title ?? null,
      author: data.author_name ?? null,
      authorUrl: data.author_url ?? null,
      thumbnailUrl: data.thumbnail_url ?? null,
    };
  } catch {
    return null;
  }
}
