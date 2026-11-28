export const DB = 'https://website-ab000-default-rtdb.asia-southeast1.firebasedatabase.app/ambalan';

export async function getNews(id) {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) return null;
  const r = await fetch(`${DB}/news/${id}.json`, { cf: { cacheTtl: 60, cacheEverything: true } });
  if (!r.ok) return null;
  const n = await r.json();
  return n && typeof n === 'object' ? n : null;
}

export const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
