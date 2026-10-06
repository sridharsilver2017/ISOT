// Cloudflare Pages Function: /api/speaker-image/[key]
// Streams speaker images directly from Cloudflare R2 bucket

export async function onRequestGet(context: { params: { key: string }; env: { BUCKET?: any } }): Promise<Response> {
  const key = context.params.key;

  if (!context.env.BUCKET) {
    return new Response('R2 BUCKET not bound', { status: 404 });
  }

  const object = await context.env.BUCKET.get(key);

  if (!object) {
    return new Response('Image Not Found', { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('Access-Control-Allow-Origin', '*');

  return new Response(object.body, { headers });
}
