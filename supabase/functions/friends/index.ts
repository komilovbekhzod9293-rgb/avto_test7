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
    const body = await req.json()
    const { action, session_token, device_id } = body

    const db = createDb()
    const session = await validateSession(db, session_token, device_id, req)
    if ('error' in session) return json({ error: session.error }, 401)
    const userId = session.user.id

    switch (action) {
      case 'search': {
        const { query } = body
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
          return json({ data: [] })
        }

        const { data: users, error } = await db
          .from('app_users')
          .select('id, login, avatar_url')
          .ilike('login', `%${query.trim()}%`)
          .neq('id', userId)
          .limit(20)
        if (error) throw error

        const { data: relations } = await db
          .from('friendships')
          .select('requester_id, addressee_id, status')
          .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)

        const result = (users || []).map((u: any) => {
          const rel = (relations || []).find(
            (r: any) =>
              (r.requester_id === userId && r.addressee_id === u.id) ||
              (r.addressee_id === userId && r.requester_id === u.id),
          )
          let friendship_status = 'none'
          if (rel) {
            if (rel.status === 'accepted') friendship_status = 'accepted'
            else if (rel.status === 'pending') {
              friendship_status = rel.requester_id === userId ? 'pending_sent' : 'pending_received'
            }
          }
          return { ...u, friendship_status }
        })

        return json({ data: result })
      }

      case 'request': {
        const { addressee_login } = body
        if (!addressee_login || typeof addressee_login !== 'string') return json({ error: 'invalid_input' }, 400)

        const { data: addressee } = await db
          .from('app_users')
          .select('id')
          .ilike('login', addressee_login.trim())
          .maybeSingle()
        if (!addressee) return json({ error: 'user_not_found' }, 404)
        if (addressee.id === userId) return json({ error: 'invalid_input' }, 400)

        const { data: existing } = await db
          .from('friendships')
          .select('id, requester_id, status')
          .or(
            `and(requester_id.eq.${userId},addressee_id.eq.${addressee.id}),and(requester_id.eq.${addressee.id},addressee_id.eq.${userId})`,
          )
          .maybeSingle()

        if (existing) {
          if (existing.status === 'accepted' || existing.status === 'pending') {
            return json({ error: 'already_exists' }, 409)
          }
          // declined -> reopen as a pending request from this user
          const { error: updErr } = await db
            .from('friendships')
            .update({ requester_id: userId, addressee_id: addressee.id, status: 'pending', responded_at: null })
            .eq('id', existing.id)
          if (updErr) throw updErr
          return json({ data: { ok: true } })
        }

        const { error: insertErr } = await db
          .from('friendships')
          .insert({ requester_id: userId, addressee_id: addressee.id })
        if (insertErr) throw insertErr

        return json({ data: { ok: true } })
      }

      case 'respond': {
        const { friendship_id, accept } = body
        if (!friendship_id || typeof accept !== 'boolean') return json({ error: 'invalid_input' }, 400)

        const { data: row } = await db
          .from('friendships')
          .select('id, addressee_id')
          .eq('id', friendship_id)
          .maybeSingle()
        if (!row || row.addressee_id !== userId) return json({ error: 'not_found' }, 404)

        const { error: updErr } = await db
          .from('friendships')
          .update({ status: accept ? 'accepted' : 'declined', responded_at: new Date().toISOString() })
          .eq('id', friendship_id)
        if (updErr) throw updErr

        return json({ data: { ok: true } })
      }

      case 'list': {
        const { data: relations, error } = await db
          .from('friendships')
          .select('id, requester_id, addressee_id, status, created_at')
          .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        if (error) throw error

        const otherIds = (relations || []).map((r: any) =>
          r.requester_id === userId ? r.addressee_id : r.requester_id,
        )
        const { data: others } = otherIds.length
          ? await db.from('app_users').select('id, login, avatar_url').in('id', otherIds)
          : { data: [] }

        const usersById = new Map((others || []).map((u: any) => [u.id, u]))

        const friends = (relations || [])
          .filter((r: any) => r.status === 'accepted')
          .map((r: any) => usersById.get(r.requester_id === userId ? r.addressee_id : r.requester_id))

        const incoming = (relations || [])
          .filter((r: any) => r.status === 'pending' && r.addressee_id === userId)
          .map((r: any) => ({ friendship_id: r.id, user: usersById.get(r.requester_id) }))

        const outgoing = (relations || [])
          .filter((r: any) => r.status === 'pending' && r.requester_id === userId)
          .map((r: any) => ({ friendship_id: r.id, user: usersById.get(r.addressee_id) }))

        return json({ data: { friends, incoming, outgoing } })
      }

      default:
        return json({ error: 'invalid_action' }, 400)
    }
  } catch (error) {
    console.error('friends error:', error)
    return json({ error: 'internal_error' }, 500)
  }
})
