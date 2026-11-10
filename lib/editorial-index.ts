/**
 * Conservative indexing gate for editorial articles.
 * A word-count check is only a technical safeguard, never a substitute
 * for human review of originality, evidence and editorial quality.
 */
export type EditorialCandidate = {
  url?: string;
  title?: string;
  body?: string | null;
  // Editorial overrides can deliberately mark a reviewed article as excluded.
  indexable?: boolean;
};
export function isEditorialArticle(item: EditorialCandidate): boolean {
  const words = (item.body || '').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean);
  return item.indexable !== false && !!item.url?.startsWith('https://') && !!item.title && words.length >= 180;
}
export function articleId(url: string): string {
  let hash = 2166136261;
  for (let i = 0; i < url.length; i++) {
    hash ^= url.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}
export function articlePath(item: EditorialCandidate): string {
  if (!item.url || !item.title) return '/guides';
  const slug = item.title.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 65).replace(/-$/,'');
  return '/articles/' + (slug || 'article') + '-' + articleId(item.url);
}
