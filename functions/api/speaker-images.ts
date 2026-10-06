// Cloudflare Pages Function: /api/speaker-images
// Handles speaker photo uploads via Cloudflare R2 / D1 storage and mapping

export async function onRequestGet(context: { env: { DB?: any; BUCKET?: any } }): Promise<Response> {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
  };

  try {
    const db = context.env.DB;
    if (!db) {
      return new Response(JSON.stringify({ images: {} }), { headers: corsHeaders });
    }

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS speaker_images (
        speaker_id TEXT PRIMARY KEY,
        image_url TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    const { results } = await db.prepare('SELECT speaker_id, image_url FROM speaker_images').all();

    const images: Record<string, string> = {};
    if (results && Array.isArray(results)) {
      for (const row of results) {
        images[row.speaker_id] = row.image_url;
      }
    }

    return new Response(JSON.stringify({ images }), { headers: corsHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ images: {}, error: err?.message }), { headers: corsHeaders });
  }
}

export async function onRequestPost(context: { request: Request; env: { DB?: any; BUCKET?: any } }): Promise<Response> {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const contentType = context.request.headers.get('content-type') || '';
    let speakerId = '';
    let imageUrl = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await context.request.formData();
      speakerId = (formData.get('speakerId') as string) || '';
      const file = formData.get('file') as File | null;
      const directUrl = formData.get('imageUrl') as string | null;

      if (!speakerId) {
        return new Response(JSON.stringify({ error: 'speakerId is required' }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      if (file && file.size > 0) {
        // If Cloudflare R2 BUCKET is bound, upload to R2
        if (context.env.BUCKET) {
          const extension = file.name.split('.').pop() || 'png';
          const r2Key = `speaker-${speakerId}-${Date.now()}.${extension}`;
          const arrayBuffer = await file.arrayBuffer();

          await context.env.BUCKET.put(r2Key, arrayBuffer, {
            httpMetadata: {
              contentType: file.type || 'image/png',
            },
          });

          // Serve via /api/speaker-image/{r2Key}
          imageUrl = `/api/speaker-image/${r2Key}`;
        } else {
          // Fallback to data URL or D1
          const arrayBuffer = await file.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          imageUrl = `data:${file.type || 'image/png'};base64,${base64}`;
        }
      } else if (directUrl) {
        imageUrl = directUrl;
      } else {
        return new Response(JSON.stringify({ error: 'No file or imageUrl provided' }), {
          status: 400,
          headers: corsHeaders,
        });
      }
    } else {
      // JSON body
      const body: any = await context.request.json();
      speakerId = body.speakerId;
      imageUrl = body.imageUrl;
    }

    if (!speakerId || !imageUrl) {
      return new Response(JSON.stringify({ error: 'speakerId and imageUrl are required' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const db = context.env.DB;
    if (db) {
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS speaker_images (
          speaker_id TEXT PRIMARY KEY,
          image_url TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `).run();

      await db
        .prepare('INSERT OR REPLACE INTO speaker_images (speaker_id, image_url, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)')
        .bind(speakerId, imageUrl)
        .run();
    }

    return new Response(JSON.stringify({ success: true, speakerId, imageUrl }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Failed to upload image' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

export async function onRequestDelete(context: { request: Request; env: { DB?: any } }): Promise<Response> {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const url = new URL(context.request.url);
    const speakerId = url.searchParams.get('speakerId');

    if (!speakerId) {
      return new Response(JSON.stringify({ error: 'speakerId query parameter required' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const db = context.env.DB;
    if (db) {
      await db.prepare('DELETE FROM speaker_images WHERE speaker_id = ?').bind(speakerId).run();
    }

    return new Response(JSON.stringify({ success: true, speakerId }), {
      headers: corsHeaders,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Failed to delete image' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
