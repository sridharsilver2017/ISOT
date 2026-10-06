import json
import re
from datetime import datetime

# Load base sessions
with open('v21_programme_sessions.json', 'r') as f:
    sessions = json.load(f)

# Apply V22 exact diff updates:
# 1. Page 9 (fri-hb2-isccm) -> Sujith Chadala
for s in sessions:
    if s['id'] == 'fri-hb2-isccm':
        for sec in s['sections']:
            for item in sec['items']:
                if item['id'] == 'fri-hb2-18':
                    item['chairpersons'] = ["Vamsi Krishna Nagalla", "Dhanalakshmi", "Banambar Ray", "Sujith Chadala"]
                    print("Updated fri-hb2-18 chairpersons:", item['chairpersons'])

# 2. Page 19 (sat-hc-notto) -> NOTTO Director Address (Anil Kumar), Beyond near relative (Dhannanjay Agarwal, Manish Balwani)
for s in sessions:
    if s['id'] == 'sat-hc-notto':
        for sec in s['sections']:
            for item in sec['items']:
                if item['id'] == 'sat-hc-05':
                    item['title'] = "NOTTO Director Address"
                    item['speakers'] = ["Anil Kumar"]
                    item['chairpersons'] = ["Vivek Kute", "Sumana Arora"]
                    print("Updated sat-hc-05:", item['title'], item['speakers'], item['chairpersons'])
                elif item['id'] == 'sat-hc-09':
                    item['chairpersons'] = ["Dhannanjay Agarwal", "Manish Balwani"]
                    print("Updated sat-hc-09 chairpersons:", item['chairpersons'])

# 3. Page 27 (sun-hb2-kidney) -> Prajit Majumdar
for s in sessions:
    if s['id'] == 'sun-hb2-kidney':
        for sec in s['sections']:
            for item in sec['items']:
                if item['id'] == 'sun-hb2-03':
                    item['chairpersons'] = ["Arpita Ray Chaudhury", "Priyanka Tolani", "Prajit Majumdar"]
                    print("Updated sun-hb2-03 chairpersons:", item['chairpersons'])

# Save v22_programme_sessions.json
with open('v22_programme_sessions.json', 'w') as f:
    json.dump(sessions, f, indent=2)

print("Saved v22_programme_sessions.json")

# Generate src/data/defaultProgramme.ts
ts_content = f"""// ISOT 2026 Scientific Programme Baseline Data (Official Brochure V22)
// Source of truth: ISOT 2026 Brochure-V22.pdf (32 pages)
// Generated on: {datetime.now().strftime('%Y-%m-%d')}
// Total Sessions: {len(sessions)}

import {{ Session }} from '../types/programme';

export const DEFAULT_PROGRAMME_SESSIONS: Session[] = {json.dumps(sessions, indent=2)};
"""

with open('src/data/defaultProgramme.ts', 'w') as f:
    f.write(ts_content)

print("Saved src/data/defaultProgramme.ts")

# Generate server/data/programme.json
with open('server/data/programme.json', 'w') as f:
    json.dump(sessions, f, indent=2)

print("Saved server/data/programme.json")

# Generate public/isot_2026_programme_v22.csv
csv_headers = [
  'Date', 'Venue', 'Session Start', 'Session End', 'Session Title',
  'Session In-Charge', 'Co In-Charge', 'Programme Coordinators',
  'Section Heading', 'Item Type', 'Item Start', 'Item End',
  'Topic / Talk Title', 'Speakers', 'Chairpersons', 'Panelists',
  'Moderators', 'Description', 'Brochure Page'
]

def escape_csv(val):
    if val is None:
        return ''
    s = str(val).strip()
    if ',' in s or '"' in s or '\n' in s:
        return '"' + s.replace('"', '""') + '"'
    return s

csv_rows = [','.join(map(escape_csv, csv_headers))]

for s in sessions:
    incharge = ', '.join(s.get('sessionInCharge', []))
    coincharge = ', '.join(s.get('coInCharge', []))
    coord = ', '.join(s.get('programmeCoordinators', []))
    for sec in s.get('sections', []):
        sec_title = sec.get('title', '')
        for item in sec.get('items', []):
            speakers = ', '.join(item.get('speakers', []))
            chairs = ', '.join(item.get('chairpersons', []))
            panelists = ', '.join(item.get('panelists', []))
            mods = ', '.join(item.get('moderators', []) or ([item.get('moderator')] if item.get('moderator') else []))
            desc = ' | '.join(item.get('description', []))
            page = str(item.get('page', s.get('page', '')))
            
            row = [
                escape_csv(s['date']),
                escape_csv(s['venue']),
                escape_csv(s['startTime']),
                escape_csv(s['endTime']),
                escape_csv(s['title']),
                escape_csv(incharge),
                escape_csv(coincharge),
                escape_csv(coord),
                escape_csv(sec_title),
                escape_csv(item.get('type', 'talk')),
                escape_csv(item.get('startTime', '')),
                escape_csv(item.get('endTime', '')),
                escape_csv(item.get('title', '')),
                escape_csv(speakers),
                escape_csv(chairs),
                escape_csv(panelists),
                escape_csv(mods),
                escape_csv(desc),
                escape_csv(page)
            ]
            csv_rows.append(','.join(row))

csv_data = '\n'.join(csv_rows)
with open('public/isot_2026_programme_v22.csv', 'w') as f:
    f.write(csv_data)

with open('isot_2026_programme_v22.csv', 'w') as f:
    f.write(csv_data)

print("Saved public/isot_2026_programme_v22.csv")

# Generate chunked seed-d1.sql to avoid SQLITE_TOOBIG
data_str = json.dumps(sessions)
chunk_size = 20000
chunks = [data_str[i:i+chunk_size] for i in range(0, len(data_str), chunk_size)]

sql_lines = [
    '-- ISOT 2026 V22 D1 Database Seed Script (Chunked to prevent SQLITE_TOOBIG)',
    'CREATE TABLE IF NOT EXISTS programme_state (id TEXT PRIMARY KEY, data TEXT, updated_at DATETIME);',
    "DELETE FROM programme_state WHERE id = 'active_programme';"
]

c0 = chunks[0].replace("'", "''")
sql_lines.append(f"INSERT INTO programme_state (id, data, updated_at) VALUES ('active_programme', '{c0}', datetime('now'));")

for c in chunks[1:]:
    esc = c.replace("'", "''")
    sql_lines.append(f"UPDATE programme_state SET data = data || '{esc}', updated_at = datetime('now') WHERE id = 'active_programme';")

with open('seed-d1.sql', 'w') as f:
    f.write('\n\n'.join(sql_lines) + '\n')

print(f"Generated seed-d1.sql with {len(chunks)} chunks.")

# Update functions/api/seed.ts
with open('functions/api/seed.ts', 'w') as f:
    f.write(f"""// Cloudflare Pages Function to seed initial V22 conference programme into D1 Database
const DEFAULT_SESSIONS = {json.dumps(sessions)};

export async function onRequestPost(context: any) {{
  return handleSeed(context);
}}

export async function onRequestGet(context: any) {{
  return handleSeed(context);
}}

async function handleSeed(context: any) {{
  const {{ env }} = context;
  if (!env.DB) {{
    return new Response(JSON.stringify({{ error: 'Database binding not configured' }}), {{
      status: 500,
      headers: {{ 'Content-Type': 'application/json' }},
    }});
  }}

  try {{
    await env.DB.prepare(
      'CREATE TABLE IF NOT EXISTS programme_state (id TEXT PRIMARY KEY, data TEXT, updated_at DATETIME)'
    ).run();

    await env.DB.prepare(
      "INSERT OR REPLACE INTO programme_state (id, data, updated_at) VALUES ('active_programme', ?, datetime('now'))"
    ).bind(JSON.stringify(DEFAULT_SESSIONS)).run();

    return new Response(JSON.stringify({{
      success: true,
      message: 'V22 Programme successfully seeded to Cloudflare D1 database',
      sessionsCount: DEFAULT_SESSIONS.length,
      timestamp: new Date().toISOString()
    }}), {{
      headers: {{ 'Content-Type': 'application/json' }},
    }});
  }} catch (err: any) {{
    return new Response(JSON.stringify({{ error: err.message }}), {{
      status: 500,
      headers: {{ 'Content-Type': 'application/json' }},
    }});
  }}
}}
""")

print("Saved functions/api/seed.ts")

# Update functions/api/programme.ts
with open('functions/api/programme.ts', 'w') as f:
    f.write(f"""import {{ verifyJwt }} from '../_jwt';

// Embedded V22 Official Programme as baseline source of truth
const V22_DEFAULT_SESSIONS = {json.dumps(sessions)};

interface Env {{
  DB: D1Database;
  JWT_SECRET: string;
}}

export const onRequestGet: PagesFunction<Env> = async (context) => {{
  const {{ env }} = context;

  if (!env.DB) {{
    return new Response(JSON.stringify(V22_DEFAULT_SESSIONS), {{
      headers: {{
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      }},
    }});
  }}

  try {{
    await env.DB.prepare(
      'CREATE TABLE IF NOT EXISTS programme_state (id TEXT PRIMARY KEY, data TEXT, updated_at DATETIME)'
    ).run();

    const row = await env.DB.prepare(
      "SELECT data, updated_at FROM programme_state WHERE id = 'active_programme'"
    ).first<{{ data: string; updated_at: string }}>();

    if (!row || !row.data) {{
      return new Response(JSON.stringify(V22_DEFAULT_SESSIONS), {{
        headers: {{
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Access-Control-Allow-Origin': '*',
        }},
      }});
    }}

    const parsed = JSON.parse(row.data);
    return new Response(JSON.stringify(parsed), {{
      headers: {{
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      }},
    }});
  }} catch (err: any) {{
    return new Response(JSON.stringify(V22_DEFAULT_SESSIONS), {{
      headers: {{
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }},
    }});
  }}
}};

export const onRequestPost: PagesFunction<Env> = async (context) => {{
  const {{ request, env }} = context;

  if (!env.DB) {{
    return new Response(JSON.stringify({{ error: 'Database binding not configured' }}), {{
      status: 500,
      headers: {{ 'Content-Type': 'application/json' }},
    }});
  }}

  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {{
    return new Response(JSON.stringify({{ error: 'Unauthorized' }}), {{
      status: 401,
      headers: {{ 'Content-Type': 'application/json' }},
    }});
  }}

  const token = authHeader.split(' ')[1];
  const payload = await verifyJwt(token, env.JWT_SECRET || 'isot2026-secret-key-development');
  if (!payload || (payload.role !== 'admin' && payload.role !== 'editor')) {{
    return new Response(JSON.stringify({{ error: 'Forbidden' }}), {{
      status: 403,
      headers: {{ 'Content-Type': 'application/json' }},
    }});
  }}

  try {{
    const body = await request.json<any>();
    const dataToSave = body.sessions || body;

    if (!Array.isArray(dataToSave) || dataToSave.length === 0) {{
      return new Response(JSON.stringify({{ error: 'Invalid sessions array' }}), {{
        status: 400,
        headers: {{ 'Content-Type': 'application/json' }},
      }});
    }}

    await env.DB.prepare(
      "INSERT OR REPLACE INTO programme_state (id, data, updated_at) VALUES ('active_programme', ?, datetime('now'))"
    ).bind(JSON.stringify(dataToSave)).run();

    return new Response(JSON.stringify({{ success: true, message: 'Programme updated successfully' }}), {{
      headers: {{ 'Content-Type': 'application/json' }},
    }});
  }} catch (err: any) {{
    return new Response(JSON.stringify({{ error: err.message }}), {{
      status: 500,
      headers: {{ 'Content-Type': 'application/json' }},
    }});
  }}
}};
""")

print("Saved functions/api/programme.ts")
