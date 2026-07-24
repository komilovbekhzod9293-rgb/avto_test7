import { corsHeaders } from '../_shared/cors.ts'
import { createDb } from '../_shared/db.ts'
import { getLast7Digits } from '../_shared/phone.ts'
import { checkFullAccess } from '../_shared/access.ts'

// Read-only diagnostic lookup for the AI consultant. Given a phone number OR a
// login, it returns a COMPACT status summary the agent uses to actually solve a
// student's problem (can't log in, lessons locked, verification failing, …).
//
// Token-economy by design: one call returns everything the agent needs in a
// small JSON (facts + a `diagnosis` code) so the model never loops multiple
// tool calls or reasons over raw table rows.
//
// Safety: callable ONLY by the n8n consultant, which sends the shared secret
// header `x-consultant-secret` (matched against env CONSULTANT_LOOKUP_SECRET).
// It never returns passwords, session tokens, other users' data, or the full
// allowed_phones list — only coarse status for the ONE number/login asked.

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const secret = Deno.env.get('CONSULTANT_LOOKUP_SECRET')
    if (!secret || req.headers.get('x-consultant-secret') !== secret) {
      return json({ error: 'unauthorized' }, 401)
    }

    // Accept the query either from the URL (?q=...) or the JSON body. The n8n
    // AI tool passes it as a URL query param (the reliably-detected place for
    // an AI-filled value), so that path takes priority.
    let q = new URL(req.url).searchParams.get('q') || ''
    if (!q && req.method !== 'GET') {
      const body = await req.json().catch(() => ({}))
      if (body && typeof body.q === 'string') q = body.q
    }
    if (!q || typeof q !== 'string' || !q.trim()) return json({ error: 'invalid_input' }, 400)

    const db = createDb()
    const raw = q.trim()
    const digits = raw.replace(/\D/g, '')
    const last7 = digits.length >= 7 ? digits.slice(-7) : ''

    const inAllowed = (phone: string | null | undefined): Promise<boolean> => checkFullAccess(db, phone || '')

    const latestVerification = async (l7: string) => {
      if (!l7) return null
      const { data } = await db
        .from('phone_verifications')
        .select('verified, expires_at, telegram_chat_id, created_at')
        .ilike('phone', `%${l7}`)
        .order('created_at', { ascending: false })
        .limit(1)
      const row = data?.[0]
      if (!row) return null
      return {
        exists: true,
        verified: !!row.verified,
        expired: new Date(row.expires_at).getTime() < Date.now(),
        telegram_linked: !!row.telegram_chat_id,
      }
    }

    // Find the account by phone suffix first, then by exact login.
    let user: any = null
    if (last7) {
      const { data } = await db
        .from('app_users')
        .select('id, phone, login, device_id, is_shared')
        .ilike('phone', `%${last7}`)
        .limit(1)
      user = data?.[0] ?? null
    }
    if (!user) {
      const { data } = await db
        .from('app_users')
        .select('id, phone, login, device_id, is_shared')
        .ilike('login', raw)
        .limit(1)
      user = data?.[0] ?? null
    }

    // --- Not registered ------------------------------------------------------
    if (!user) {
      const paid = last7 ? await inAllowed(digits) : false
      const verification = await latestVerification(last7)
      // paid but no account = they must still finish registration;
      // otherwise they simply haven't registered (or wrong number/login given).
      const diagnosis = paid ? 'paid_not_registered' : 'not_registered'
      return json({
        data: { query: raw, registered: false, in_allowed_phones: paid, verification: verification ?? { exists: false }, diagnosis },
      })
    }

    // --- Registered ----------------------------------------------------------
    const paid = await inAllowed(user.phone)
    const access = user.is_shared ? 'shared' : paid ? 'full' : 'trial'
    const verification = await latestVerification(getLast7Digits(user.phone))

    const { count: topicsCompleted } = await db
      .from('topic_progress')
      .select('topic_id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('completed', true)
    const { count: topicsTotal } = await db
      .from('topics')
      .select('id', { count: 'exact', head: true })
    const { data: stats } = await db
      .from('user_stats')
      .select('tests_taken')
      .eq('user_id', user.id)
      .maybeSingle()

    const diagnosis =
      access === 'shared' ? 'registered_shared' : access === 'full' ? 'registered_full' : 'registered_trial'

    return json({
      data: {
        query: raw,
        registered: true,
        login: user.login,
        phone: user.phone,
        access, // 'full' | 'trial' | 'shared'
        in_allowed_phones: paid,
        device_bound: !!user.device_id,
        verification: verification ?? { exists: false },
        progress: {
          topics_completed: topicsCompleted ?? 0,
          topics_total: topicsTotal ?? 0,
          tests_taken: stats?.tests_taken ?? 0,
        },
        diagnosis,
      },
    })
  } catch (error) {
    console.error('consultant-lookup error:', error)
    return json({ error: 'internal_error' }, 500)
  }
})
