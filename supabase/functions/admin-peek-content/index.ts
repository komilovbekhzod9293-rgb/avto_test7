import { corsHeaders } from '../_shared/cors.ts'
import { createDb } from '../_shared/db.ts'

// ONE-OFF, READ-ONLY helper for the Russian-translation project: lets me look
// up the existing Uzbek questions/answers for a topic to resolve ambiguous
// translations against the real source of truth, without needing SQL access.
// Never writes anything. Gated by the existing CONSULTANT_LOOKUP_SECRET.
//
// POST { action: 'topics' } -> all topics with lesson info
// POST { action: 'questions', topic_id } -> questions+answers for a topic

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const secret = Deno.env.get('CONSULTANT_LOOKUP_SECRET')
  if (!secret || req.headers.get('x-admin-secret') !== secret) {
    return json({ error: 'unauthorized' }, 401)
  }

  try {
    const { action, topic_id } = await req.json()
    const db = createDb()

    if (action === 'topics') {
      const { data: lessons } = await db.from('lessons').select('id, title, order_index').order('order_index')
      const { data: topics } = await db
        .from('topics')
        .select('id, lesson_id, title_uz_cyr, order_index')
        .order('order_index')
      return json({ data: { lessons, topics } })
    }

    if (action === 'questions') {
      if (!topic_id) return json({ error: 'topic_id required' }, 400)
      const { data: questions } = await db
        .from('questions')
        .select('id, question_uz_cyr, image_path, order_index')
        .eq('topic_id', topic_id)
        .order('order_index')
      const questionIds = (questions ?? []).map((q) => q.id)
      const { data: answers } = questionIds.length
        ? await db.from('answers').select('id, question_id, answer_uz_cyr, is_correct').in('question_id', questionIds)
        : { data: [] }
      const byQuestion: Record<string, unknown[]> = {}
      for (const a of answers ?? []) {
        const qid = (a as { question_id: string }).question_id
        byQuestion[qid] ??= []
        byQuestion[qid].push(a)
      }
      const result = (questions ?? []).map((q) => ({ ...q, answers: byQuestion[q.id] ?? [] }))
      return json({ data: result })
    }

    return json({ error: 'invalid_action' }, 400)
  } catch (error) {
    console.error('admin-peek-content error:', error)
    return json({ error: 'internal_error', detail: String(error) }, 500)
  }
})
