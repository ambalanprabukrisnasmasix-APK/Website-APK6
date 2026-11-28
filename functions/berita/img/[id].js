import { getNews } from '../_shared.js';

export async function onRequestGet({ params, request }) {
  const id = String(params.id).replace(/\.(jpe?g|png|webp)$/i, '');
  const n = await getNews(id);
  const m = n && /^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/is.exec(String(n.img || ''));
  if (!m) return Response.redirect(new URL(request.url).origin + '/favicon-192.png', 302);

  const bin = atob(m[2].replace(/\s/g, ''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

  return new Response(bytes, {
    headers: {
      'content-type': m[1] === 'image/jpg' ? 'image/jpeg' : m[1],
      'cache-control': 'public, max-age=86400',
      'content-length': String(bytes.length)
    }
  });
}
