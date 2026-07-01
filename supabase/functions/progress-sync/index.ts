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
      case 'get': {
        const { data: rows, error: progErr } = await db
          .from('topic_progress')
          .select('topic_id, best_score, completed, best_time_seconds, best_time_question_count')
          .eq('user_id', userId)
        if (progErr) throw progErr

        let { data: stats, error: statsErr } = await db
          .from('user_stats')
          .select('tests_taken, correct_answers, wrong_answers, last_lesson_id, last_topic_id')
          .eq('user_id', userId)
          .maybeSingle()
        if (statsErr) throw statsErr

        // Students who finished topics before accounts existed (imported via
        // 'migrate') have completed topic_progress rows but no aggregate
        // counts, since localStorage never tracked those. Backfill once from
        // the actual question counts so "Мои натижаларим" isn't stuck at 0.
        const completedRows = (rows || []).filter((r) => r.completed)
        if ((!stats || stats.tests_taken === 0) && completedRows.length > 0) {
          let testsTaken = 0
          let correct = 0
          let wrong = 0
          for (const row of completedRows) {
            const { count } = await db
              .from('questions')
              .select('id', { count: 'exact', head: true })
              .eq('topic_id', row.topic_id)
            const questionCount = count ?? 0
            const correctForTopic = Math.round((row.best_score / 100) * questionCount)
            testsTaken += 1
            correct += correctForTopic
            wrong += questionCount - correctForTopic
          }

          const { data: backfilled, error: backfillErr } = await db
            .from('user_stats')
            .upsert(
              {
                user_id: userId,
                tests_taken: testsTaken,
                correct_answers: correct,
                wrong_answers: wrong,
                last_lesson_id: stats?.last_lesson_id ?? null,
                last_topic_id: stats?.last_topic_id ?? null,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id' },
            )
            .select('tests_taken, correct_answers, wrong_answers, last_lesson_id, last_topic_id')
            .single()
          if (backfillErr) throw backfillErr
          stats = backfilled
        }

        const topicProgress: Record<
          string,
          { bestScore: number; completed: boolean; bestTimeSeconds: number | null; bestTimeQuestionCount: number | null }
        > = {}
        for (const row of rows || []) {
          topicProgress[row.topic_id] = {
            bestScore: row.best_score,
            completed: row.completed,
            bestTimeSeconds: row.best_time_seconds,
            bestTimeQuestionCount: row.best_time_question_count,
          }
        }

        return json({
          data: {
            topic_progress: topicProgress,
            stats: stats || { tests_taken: 0, correct_answers: 0, wrong_answers: 0, last_lesson_id: null, last_topic_id: null },
          },
        })
      }

      case 'set-topic': {
        const { topic_id, score, correct_count, wrong_count, time_seconds, question_count } = body
        if (!topic_id || typeof score !== 'number') return json({ error: 'invalid_input' }, 400)

        const { data: existing } = await db
          .from('topic_progress')
          .select('best_score, best_time_seconds')
          .eq('user_id', userId)
          .eq('topic_id', topic_id)
          .maybeSingle()

        const bestScore = Math.max(existing?.best_score ?? 0, score)
        const completed = bestScore >= 95

        // Only a passing run can set a time record, and only if it beats
        // the existing one (or there isn't one yet).
        let bestTimeSeconds = existing?.best_time_seconds ?? null
        let bestTimeQuestionCount: number | null = null
        if (completed && typeof time_seconds === 'number') {
          if (bestTimeSeconds === null || time_seconds < bestTimeSeconds) {
            bestTimeSeconds = time_seconds
            bestTimeQuestionCount = typeof question_count === 'number' ? question_count : null
          }
        }

        const updatePayload: Record<string, unknown> = {
          user_id: userId,
          topic_id,
          best_score: bestScore,
          completed,
          updated_at: new Date().toISOString(),
        }
        if (bestTimeSeconds !== null) updatePayload.best_time_seconds = bestTimeSeconds
        if (bestTimeQuestionCount !== null) updatePayload.best_time_question_count = bestTimeQuestionCount

        const { data: updated, error: upsertErr } = await db
          .from('topic_progress')
          .upsert(updatePayload, { onConflict: 'user_id,topic_id' })
          .select('topic_id, best_score, completed, best_time_seconds, best_time_question_count')
          .single()
        if (upsertErr) throw upsertErr

        const { data: currentStats } = await db
          .from('user_stats')
          .select('tests_taken, correct_answers, wrong_answers')
          .eq('user_id', userId)
          .maybeSingle()

        const { data: newStats, error: statsErr } = await db
          .from('user_stats')
          .upsert(
            {
              user_id: userId,
              tests_taken: (currentStats?.tests_taken ?? 0) + 1,
              correct_answers: (currentStats?.correct_answers ?? 0) + (correct_count || 0),
              wrong_answers: (currentStats?.wrong_answers ?? 0) + (wrong_count || 0),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' },
          )
          .select('tests_taken, correct_answers, wrong_answers')
          .single()
        if (statsErr) throw statsErr

        return json({ data: { topic_progress: updated, stats: newStats } })
      }

      case 'set-active-location': {
        const { lesson_id, topic_id } = body
        const { error: updateErr } = await db
          .from('user_stats')
          .upsert(
            { user_id: userId, last_lesson_id: lesson_id ?? null, last_topic_id: topic_id ?? null, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' },
          )
        if (updateErr) throw updateErr
        return json({ data: { ok: true } })
      }

      case 'migrate': {
        const { local_progress, active_topic } = body
        const entries = Object.entries(local_progress || {}) as Array<
          [string, { bestScore: number; completed: boolean }]
        >

        for (const [topicId, incoming] of entries) {
          const { data: existing } = await db
            .from('topic_progress')
            .select('best_score')
            .eq('user_id', userId)
            .eq('topic_id', topicId)
            .maybeSingle()

          const bestScore = Math.max(existing?.best_score ?? 0, incoming.bestScore ?? 0)
          await db.from('topic_progress').upsert(
            { user_id: userId, topic_id: topicId, best_score: bestScore, completed: bestScore >= 95, updated_at: new Date().toISOString() },
            { onConflict: 'user_id,topic_id' },
          )
        }

        if (active_topic) {
          await db.from('user_stats').upsert(
            { user_id: userId, last_topic_id: active_topic, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' },
          )
        }

        return json({ data: { migrated: entries.length } })
      }

      default:
        return json({ error: 'invalid_action' }, 400)
    }
  } catch (error) {
    console.error('progress-sync error:', error)
    return json({ error: 'internal_error' }, 500)
  }
})
