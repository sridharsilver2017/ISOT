import { verifyJwt } from '../../_jwt';

export async function onRequestPost(context: any) {
  const { request, env } = context;

  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const token = authHeader.split(' ')[1];
  const user = await verifyJwt(token, env.JWT_SECRET);
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Forbidden' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    if (env.DB) {
      await env.DB.prepare("DELETE FROM programme_data WHERE id = 'active_programme'").run();
    }

    if (env.ISOT_KV) {
      await env.ISOT_KV.delete('active_programme');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Programme reset to official default schedule in Cloudflare Database.',
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Database delete error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
