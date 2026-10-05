export async function onRequestGet(context: any) {
  return new Response(
    JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'ISOT 2026 Cloudflare Edge API',
      engine: 'Cloudflare Pages Functions + D1 Database',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
