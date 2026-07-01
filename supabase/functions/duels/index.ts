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
    const session = await validateSession(db, session_token, device_id)
    if ('error' in session) return json({ error: session.error }, 401)
    const userId = session.user.id

    switch (action) {
      case 'challenge': {
        const { opponent_login } = body
        if (!opponent_login || typeof opponent_login !== 'string') return json({ error: 'invalid_input' }, 400)

        const { data: opponent } = await db
          .from('app_users')
          .select('id')
          .ilike('login', opponent_login.trim())
          .maybeSingle()
        if (!opponent) return json({ error: 'user_not_found' }, 404)
        if (opponent.id === userId) return json({ error: 'invalid_input' }, 400)

        const { data: friendship } = await db
          .from('friendships')
          .select('id, status')
          .or(
            `and(requester_id.eq.${userId},addressee_id.eq.${opponent.id}),and(requester_id.eq.${opponent.id},addressee_id.eq.${userId})`,
          )
          .maybeSingle()
        if (!friendship || friendship.status !== 'accepted') return json({ error: 'not_friends' }, 403)

        const { data: topics } = await db.from('topics').select('id')
        if (!topics || topics.length === 0) return json({ error: 'no_topics_available' }, 500)
        const topicId = topics[Math.floor(Math.random() * topics.length)].id

        const { data: duel, error: insertErr } = await db
          .from('duels')
          .insert({ challenger_id: userId, opponent_id: opponent.id, topic_id: topicId })
          .select('id')
          .single()
        if (insertErr) throw insertErr

        return json({ data: { duel_id: duel.id } })
      }

      case 'respond': {
        const { duel_id, accept } = body
        if (!duel_id || typeof accept !== 'boolean') return json({ error: 'invalid_input' }, 400)

        const { data: duel } = await db
          .from('duels')
          .select('id, opponent_id, status')
          .eq('id', duel_id)
          .maybeSingle()
        if (!duel || duel.opponent_id !== userId || duel.status !== 'pending') return json({ error: 'not_found' }, 404)

        const { error: updateErr } = await db
          .from('duels')
          .update({ status: accept ? 'active' : 'declined', responded_at: new Date().toISOString() })
          .eq('id', duel_id)
        if (updateErr) throw updateErr

        return json({ data: { ok: true } })
      }

      case 'list': {
        const { data: rows, error } = await db
          .from('duels')
          .select(
            'id, challenger_id, opponent_id, topic_id, status, challenger_score, opponent_score, winner_id, created_at',
          )
          .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
          .in('status', ['pending', 'active'])
          .order('created_at', { ascending: false })
        if (error) throw error

        const otherIds = (rows || []).map((d: any) => (d.challenger_id === userId ? d.opponent_id : d.challenger_id))
        const { data: others } = otherIds.length
          ? await db.from('app_users').select('id, login, avatar_url').in('id', otherIds)
          : { data: [] }
        const usersById = new Map((others || []).map((u: any) => [u.id, u]))

        const incoming = (rows || [])
          .filter((d: any) => d.status === 'pending' && d.opponent_id === userId)
          .map((d: any) => ({ ...d, opponent_user: usersById.get(d.challenger_id) }))
        const outgoing = (rows || [])
          .filter((d: any) => d.status === 'pending' && d.challenger_id === userId)
          .map((d: any) => ({ ...d, opponent_user: usersById.get(d.opponent_id) }))
        const active = (rows || [])
          .filter((d: any) => d.status === 'active')
          .map((d: any) => ({
            ...d,
            opponent_user: usersById.get(d.challenger_id === userId ? d.opponent_id : d.challenger_id),
          }))

        return json({ data: { incoming, outgoing, active } })
      }

      case 'get': {
        const { duel_id } = body
        if (!duel_id) return json({ error: 'invalid_input' }, 400)

        const { data: duel } = await db.from('duels').select('*').eq('id', duel_id).maybeSingle()
        if (!duel || (duel.challenger_id !== userId && duel.opponent_id !== userId)) {
          return json({ error: 'not_found' }, 404)
        }

        const otherId = duel.challenger_id === userId ? duel.opponent_id : duel.challenger_id
        const { data: other } = await db.from('app_users').select('id, login, avatar_url').eq('id', otherId).maybeSingle()

        const isChallenger = duel.challenger_id === userId
        return json({
          data: {
            ...duel,
            opponent_user: other,
            my_score: isChallenger ? duel.challenger_score : duel.opponent_score,
            my_finished: isChallenger ? duel.challenger_finished : duel.opponent_finished,
            opponent_score: isChallenger ? duel.opponent_score : duel.challenger_score,
            opponent_finished: isChallenger ? duel.opponent_finished : duel.challenger_finished,
          },
        })
      }

      case 'submit-result': {
        const { duel_id, correct_count, total_questions } = body
        if (!duel_id || typeof correct_count !== 'number' || typeof total_questions !== 'number') {
          return json({ error: 'invalid_input' }, 400)
        }

        const { data: duel } = await db.from('duels').select('*').eq('id', duel_id).maybeSingle()
        if (!duel || (duel.challenger_id !== userId && duel.opponent_id !== userId) || duel.status !== 'active') {
          return json({ error: 'not_found' }, 404)
        }

        const isChallenger = duel.challenger_id === userId
        const update: Record<string, unknown> = isChallenger
          ? { challenger_score: correct_count, challenger_finished: true }
          : { opponent_score: correct_count, opponent_finished: true }
        update.total_questions = total_questions

        const bothFinished = isChallenger ? duel.opponent_finished : duel.challenger_finished
        if (bothFinished) {
          const challengerScore = isChallenger ? correct_count : duel.challenger_score
          const opponentScore = isChallenger ? duel.opponent_score : correct_count
          update.status = 'completed'
          update.completed_at = new Date().toISOString()
          update.winner_id =
            challengerScore === opponentScore
              ? null
              : challengerScore > opponentScore
                ? duel.challenger_id
                : duel.opponent_id
        }

        const { error: updateErr } = await db.from('duels').update(update).eq('id', duel_id)
        if (updateErr) throw updateErr

        return json({ data: { ok: true, completed: !!bothFinished } })
      }

      case 'leaderboard': {
        const { data, error } = await db.rpc('get_duel_leaderboard')
        if (error) throw error
        return json({ data })
      }

      default:
        return json({ error: 'invalid_action' }, 400)
    }
  } catch (error) {
    console.error('duels error:', error)
    return json({ error: 'internal_error' }, 500)
  }
})
