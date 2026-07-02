import { corsHeaders } from '../_shared/cors.ts'
import { createDb } from '../_shared/db.ts'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Public, no session required -- this is just a social-proof number shown
// on the auth screen, not account data.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const db = createDb()

    const [{ count, error: countErr }, { data: baseline, error: baseErr }] = await Promise.all([
      db.from('user_growth_log').select('*', { count: 'exact', head: true }),
      db.from('site_stats').select('value').eq('key', 'user_count_baseline').maybeSingle(),
    ])
    if (countErr) throw countErr
    if (baseErr) throw baseErr

    const total = Number(baseline?.value ?? 0) + (count ?? 0)
    return json({ data: { count: total } })
  } catch (error) {
    console.error('user-count error:', error)
    return json({ error: 'internal_error' }, 500)
  }
})
