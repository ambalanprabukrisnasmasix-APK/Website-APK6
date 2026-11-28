import { getNews, esc } from './_shared.js';

export async function onRequestGet({ params, request }) {
  const id = params.id;
  const origin = new URL(request.url).origin;
  const n = await getNews(id);

  if (!n) return Response.redirect(origin + '/', 302);

  const title = String(n.title || 'Berita Ambalan Prabu Krisna');
  const desc = String(n.text || '').replace(/\s+/g, ' ').trim().slice(0, 160) || 'Berita kegiatan Ambalan Prabu Krisna.';
  const page = `${origin}/berita/${encodeURIComponent(id)}`;
  const target = `${origin}/#berita-${encodeURIComponent(id)}`;

  const img = String(n.img || '');
  let ogImage = `${origin}/favicon-192.png`;
  if (/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(img)) {
    ogImage = `${origin}/berita/img/${encodeURIComponent(id)}.jpg?v=${encodeURIComponent(String(n.date || ''))}-${img.length}`;
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
</body></html>`;

  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300' }
  });
}
