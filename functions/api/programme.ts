import { verifyJwt } from '../_jwt';

// Helper to ensure D1 table exists
async function ensureD1Table(db: any) {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS programme_data (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        last_updated TEXT NOT NULL,
        updated_by TEXT NOT NULL
      );
    `);
  } catch (err) {
    console.warn('Could not auto-create D1 table:', err);
  }
}

// GET: Fetch live conference programme from Database
export async function onRequestGet(context: any) {
  const { env } = context;

  try {
    // 1. Primary: Cloudflare D1 Database (Multi-row session query)
    if (env.DB) {
      await ensureD1Table(env.DB);
      const rows = await env.DB.prepare(
        "SELECT * FROM programme_data WHERE id LIKE 'session_%' ORDER BY id"
      ).all();

      if (rows && rows.results && rows.results.length > 0) {
        const sessions = rows.results.map((r: any) => JSON.parse(r.data));
        return new Response(
          JSON.stringify({
            hasCustomData: true,
            sessions,
            lastUpdated: rows.results[0]?.last_updated || new Date().toISOString(),
            updatedBy: rows.results[0]?.updated_by || 'ISOT Admin',
            storage: 'Cloudflare D1 SQL Database',
            databaseName: 'isot2026',
            databaseId: 'ea1748cd-971b-475b-92b1-4a2e0c95f211',
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
          }
        );
      }

      // Fallback single row check
      const singleRow = await env.DB.prepare(
        "SELECT * FROM programme_data WHERE id = 'active_programme'"
      ).first();

      if (singleRow && singleRow.data) {
        const sessions = JSON.parse(singleRow.data);
        return new Response(
          JSON.stringify({
            hasCustomData: true,
            sessions,
            lastUpdated: singleRow.last_updated,
            updatedBy: singleRow.updated_by,
            storage: 'Cloudflare D1 SQL Database',
            databaseName: 'isot2026',
            databaseId: 'ea1748cd-971b-475b-92b1-4a2e0c95f211',
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
          }
        );
      }
    }

    // 2. Cloudflare KV Store (secondary edge cache)
    if (env.ISOT_KV) {
      const kvData = await env.ISOT_KV.get('active_programme', 'json');
      if (kvData && kvData.sessions) {
        return new Response(
          JSON.stringify({
            hasCustomData: true,
            sessions: kvData.sessions,
            lastUpdated: kvData.lastUpdated,
            updatedBy: kvData.updatedBy,
            storage: 'Cloudflare KV Store',
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
          }
        );
      }
    }

    // 3. Fallback: Database is empty or uninitialized
    return new Response(
      JSON.stringify({
        hasCustomData: false,
        sessions: null,
        message: 'No active programme record found in D1 database.',
        storage: 'None',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Database query error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

// PUT: Save updated programme to Cloudflare Database (Admin Only)
export async function onRequestPut(context: any) {
  const { request, env } = context;

  // 1. Verify Authorization
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: Admin token required to update database.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const token = authHeader.split(' ')[1];
  const user = await verifyJwt(token, env.JWT_SECRET);
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Forbidden: Invalid or expired admin session.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 2. Parse payload
  try {
    const { sessions } = await request.json();
    if (!sessions || !Array.isArray(sessions)) {
      return new Response(
        JSON.stringify({ error: 'Invalid payload. sessions array required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const lastUpdated = new Date().toISOString();
    const updatedBy = user.name || user.username || 'Admin';

    // 3. Persist to Cloudflare D1 Database via batch queries
    if (env.DB) {
      await ensureD1Table(env.DB);
      const stmts: any[] = [
        env.DB.prepare("DELETE FROM programme_data WHERE id LIKE 'session_%' OR id = 'active_programme'")
      ];

      for (let i = 0; i < sessions.length; i++) {
        const sess = sessions[i];
        const sessKey = `session_${String(i + 1).padStart(2, '0')}_${(sess.id || `sess_${i + 1}`).replace(/[^a-zA-Z0-9_]/g, '_')}`;
        stmts.push(
          env.DB.prepare(
            "INSERT INTO programme_data (id, data, last_updated, updated_by) VALUES (?, ?, ?, ?)"
          ).bind(sessKey, JSON.stringify(sess), lastUpdated, updatedBy)
        );
      }

      await env.DB.batch(stmts);
    }

    // 4. Persist to Cloudflare KV (if available)
    if (env.ISOT_KV) {
      await env.ISOT_KV.put(
        'active_programme',
        JSON.stringify({
          sessions,
          lastUpdated,
          updatedBy,
        })
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Programme successfully saved to Cloudflare Database.',
        lastUpdated,
        updatedBy,
        sessionCount: sessions.length,
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
      JSON.stringify({ error: err.message || 'Database write error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
