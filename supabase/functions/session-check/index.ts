import { corsHeaders } from '../_shared/cors.ts'
import { createDb } from '../_shared/db.ts'
import { validateSession } from '../_shared/session.ts'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { session_token, device_id } = await req.json()
    const db = createDb()
    const result = await validateSession(db, session_token, device_id, req)

    if ('error' in result) {
      const status = result.error === 'invalid_session' ? 401 : 401
      return json({ error: result.error }, status)
    }

    return json({ data: { user: result.user } })
  } catch (error) {
    console.error('session-check error:', error)
    return json({ error: 'internal_error' }, 500)
  }
})
