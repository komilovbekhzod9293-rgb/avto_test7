import { corsHeaders } from '../_shared/cors.ts'
import { createDb } from '../_shared/db.ts'

// Silent client-side error telemetry.
//
// Students report login failures as vague retellings ("server error"), and we
// cannot ask each of them for screenshots. So the auth page POSTs the real
// failure (code, technical detail, user agent) here and we read it back with
// the shared consultant secret. POST accepts text/plain because the client
// uses sendBeacon, which cannot send application/json without a preflight.
//
// GET  + x-consultant-secret  -> last 100 errors (diagnostics)
// POST {stage, code, detail, login, url} -> insert one row (never fails loudly)

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const db = createDb()

    if (req.method === 'GET') {
      const secret = Deno.env.get('CONSULTANT_LOOKUP_SECRET')
      if (!secret || req.headers.get('x-consultant-secret') !== secret) {
        return json({ error: 'unauthorized' }, 401)
      }
      const { data, error } = await db
        .from('client_errors')
        .select('created_at, stage, code, detail, login, user_agent, url')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return json({ data })
    }

    const text = await req.text()
    const b = JSON.parse(text || '{}')
    await db.from('client_errors').insert({
      stage: String(b.stage ?? 'unknown').slice(0, 60),
      code: b.code != null ? String(b.code).slice(0, 80) : null,
      detail: b.detail != null ? String(b.detail).slice(0, 400) : null,
      login: b.login != null ? String(b.login).slice(0, 60) : null,
      url: b.url != null ? String(b.url).slice(0, 200) : null,
      user_agent: (req.headers.get('user-agent') ?? '').slice(0, 300),
    })
    return new Response('ok', { headers: corsHeaders })
  } catch (_e) {
    // Telemetry must never create new errors of its own.
    return new Response('ok', { headers: corsHeaders })
  }
})
