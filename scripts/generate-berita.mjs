import { mkdir, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const DB = process.env.DB_URL || 'https://website-ab000-default-rtdb.asia-southeast1.firebasedatabase.app/ambalan';
const SITE = 'https://ambalanprabukrisna.my.id';

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const res = await fetch(`${DB}/news.json`);
if (!res.ok) {
  console.error('Gagal membaca database, status', res.status);
  process.exit(1);
}
const data = (await res.json()) || {};

await rm('berita', { recursive: true, force: true });
await rm('img-berita', { recursive: true, force: true });
await mkdir('berita', { recursive: true });
await mkdir('img-berita', { recursive: true });

const EXT = { jpeg: 'jpg', jpg: 'jpg', png: 'png', webp: 'webp' };
let count = 0;

for (const [id, n] of Object.entries(data)) {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id) || !n || typeof n !== 'object') continue;

  const title = String(n.title || 'Berita Ambalan Prabu Krisna');
  const desc = String(n.text || '').replace(/\s+/g, ' ').trim().slice(0, 160) || 'Berita kegiatan Ambalan Prabu Krisna.';
  const page = `${SITE}/berita/${id}/`;
  const target = `${SITE}/#berita-${id}`;

  let ogImage = `${SITE}/favicon-192.png`;
  const img = String(n.img || '');
  const m = /^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/is.exec(img);
  if (m) {
    const buf = Buffer.from(m[2].replace(/\s/g, ''), 'base64');
    if (buf.length > 0) {
      const hash = createHash('sha1').update(buf).digest('hex').slice(0, 8);
      const file = `${id}-${hash}.${EXT[m[1].toLowerCase()]}`;
      await writeFile(`img-berita/${file}`, buf);
      ogImage = `${SITE}/img-berita/${file}`;
    }
  } else if (/^https:\/\//i.test(img)) {
    ogImage = img;
  }

  const html = `<!DOCTYPE html>
<html lang="id"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} – Ambalan Prabu Krisna</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(page)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Ambalan Prabu Krisna">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(page)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta property="og:image:secure_url" content="${esc(ogImage)}">
<meta property="og:image:alt" content="${esc(title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(ogImage)}">
</head><body>
<p><a href="${esc(target)}">${esc(title)}</a></p>
<script>location.replace(${JSON.stringify(target)});</script>
<noscript><a href="${esc(target)}">Buka berita</a></noscript>
</body></html>
`;
  await mkdir(`berita/${id}`, { recursive: true });
  await writeFile(`berita/${id}/index.html`, html);
  count++;
}
console.log(`Selesai: ${count} halaman berita dibuat.`);
