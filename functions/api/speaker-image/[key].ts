function getR2Bucket(env: any) {
  return env?.BUCKET || env?.['isot-2026'] || env?.ISOT_2026 || env?.R2_BUCKET || env?.STORAGE;
}

export async function onRequestGet(context: { params: { key: string }; env: any }): Promise<Response> {
  const key = context.params.key;
  const bucket = getR2Bucket(context.env);

  if (!bucket) {
    return new Response('R2 BUCKET (isot-2026) not bound', { status: 404 });
  }

  const object = await bucket.get(key);

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
