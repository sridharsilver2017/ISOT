function getR2Bucket(env: any) {
  return env?.BUCKET || env?.['isot-2026'] || env?.ISOT_2026 || env?.R2_BUCKET || env?.STORAGE;
}

export async function onRequestGet(context: { params: { key: string }; env: any }): Promise<Response> {
  const key = decodeURIComponent(context.params.key || '');
  const bucket = getR2Bucket(context.env);

  if (!bucket) {
    return new Response('R2 BUCKET (isot-2026) not bound', { status: 404 });
  }

  // Try direct key, then speaker-photos/ prefix
  let object = await bucket.get(key);
  if (!object && !key.startsWith('speaker-photos/')) {
    object = await bucket.get(`speaker-photos/${key}`);
  }
  if (!object && !key.endsWith('.png')) {
    object = await bucket.get(`speaker-photos/${key}.png`);
  }

  if (!object) {
    return new Response('Image Not Found', { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  if (object.httpEtag) headers.set('etag', object.httpEtag);
  headers.set('Content-Type', object.httpMetadata?.contentType || 'image/png');
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('Access-Control-Allow-Origin', '*');

  return new Response(object.body, { headers });
}
