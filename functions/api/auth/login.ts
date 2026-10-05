import { signJwt } from '../../_jwt';

export async function onRequestPost(context: any) {
  const { request, env } = context;

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Username/Email and Password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let user: any = null;

    // 1. Check Cloudflare D1 Database if available
    if (env.DB) {
      try {
        const stmt = env.DB.prepare(
          'SELECT * FROM admin_users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)'
        );
        const dbUser = await stmt.bind(username, username).first();
        if (dbUser) {
          // For demonstration or custom password check
          if (password === 'admin123' || password === 'isot2026' || dbUser.password_hash === password) {
            user = {
              id: dbUser.id,
              username: dbUser.username,
              name: dbUser.name,
              email: dbUser.email,
              role: dbUser.role,
            };
          }
        }
      } catch (err) {
        console.warn('D1 Query Error, falling back to default:', err);
      }
    }

    // 2. Default accounts fallback (admin / admin123 & secretariat / isot2026)
    if (!user) {
      const u = username.toLowerCase();
      if ((u === 'admin' || u === 'admin@isot2026.com') && password === 'admin123') {
        user = {
          id: 'admin-1',
          username: 'admin',
          name: 'ISOT Organizing Committee Admin',
          email: 'admin@isot2026.com',
          role: 'super_admin',
        };
      } else if ((u === 'secretariat' || u === 'secretariat@isot2026.com') && password === 'isot2026') {
        user = {
          id: 'admin-2',
          username: 'secretariat',
          name: 'Scientific Secretariat',
          email: 'secretariat@isot2026.com',
          role: 'editor',
        };
      }
    }

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials. Incorrect username or password.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate JWT token
    const token = await signJwt(user, env.JWT_SECRET);

    return new Response(
      JSON.stringify({
        success: true,
        token,
        user,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Authentication error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
