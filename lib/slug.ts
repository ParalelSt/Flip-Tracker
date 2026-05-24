/** Slugify a name for use as a trick slug. Lowercase, alphanumeric + hyphens,
 *  trimmed. Empty names fall back to "trick" so the suffix still uniquifies. */
export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'trick';
}

/** Append a short random suffix so user-generated slugs don't collide with
 *  canonical seeded slugs or other users' tricks. */
export function uniqueSlug(name: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${slugify(name)}-${rand}`;
}
