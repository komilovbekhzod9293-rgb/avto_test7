import { corsHeaders } from '../_shared/cors.ts'
import { createDb } from '../_shared/db.ts'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Public, no session required -- powers the landing page's "try before you
// sign up" flow (first lesson + a short final-test sample). Deliberately
// capped (fixed 20-question sample, first lesson only) so it stays a taste,
// not a way to access the whole question bank anonymously.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()
    const { action, topic_id, lang } = body
    const isRu = lang === 'ru'
    const db = createDb()
    const storageBaseUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/question-images`
    const storageBaseUrlRu = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/question-images-ru`

    if (action === 'free-lesson') {
      const { data: lesson, error: lErr } = await db
        .from('lessons')
        .select('id, title, order_index')
        .order('order_index', { ascending: true })
        .limit(1)
        .maybeSingle()
      if (lErr) throw lErr
      if (!lesson) return json({ data: { lesson: null, topics: [] } })

      const { data: topics, error: tErr } = await db
        .from('topics')
        .select('id, lesson_id, title_uz_cyr, order_index, youtube_url')
        .eq('lesson_id', lesson.id)
        .order('order_index', { ascending: true })
      if (tErr) throw tErr

      return json({ data: { lesson, topics: topics || [] } })
    }

    if (action === 'free-topic-questions') {
      if (!topic_id) return json({ error: 'topic_id required' }, 400)

      const { data: questions, error: qErr } = await db
        .from(isRu ? 'questions_ru' : 'questions')
        .select(isRu ? 'id, topic_id, question_ru, image_path, order_index' : 'id, topic_id, question_uz_cyr, image_path, order_index')
        .eq('topic_id', topic_id)
        .order('order_index', { ascending: true })
      if (qErr) throw qErr
      if (!questions || questions.length === 0) return json({ data: [] })

      const qIds = questions.map((q: { id: string }) => q.id)
      const { data: answers, error: aErr } = await db
        .from(isRu ? 'answers_ru' : 'answers')
        .select(isRu ? 'id, question_id, answer_ru, is_correct' : 'id, question_id, answer_uz_cyr, is_correct')
        .in('question_id', qIds)
      if (aErr) throw aErr

      const result = questions.map((q: any) => ({
        ...q,
        question_uz_cyr: isRu ? q.question_ru : q.question_uz_cyr,
        image_url: q.image_path ? `${isRu ? storageBaseUrlRu : storageBaseUrl}/${q.image_path}` : null,
        answers: (answers || [])
          .filter((a: { question_id: string }) => a.question_id === q.id)
          .map((a: any) => ({ ...a, answer_uz_cyr: isRu ? a.answer_ru : a.answer_uz_cyr })),
      }))
      return json({ data: result })
    }

    if (action === 'free-final-test') {
      const { data, error } = await db.rpc(
        isRu ? 'get_random_test_questions_ru' : 'get_random_test_questions',
        { question_count: 20 }
      )
      if (error) throw error
      const result = (data || []).map((q: any) => ({
        ...q,
        question_uz_cyr: isRu ? q.question_ru : q.question_uz_cyr,
        image_url: q.image_path ? `${isRu ? storageBaseUrlRu : storageBaseUrl}/${q.image_path}` : null,
        answers: (Array.isArray(q.answers) ? q.answers : JSON.parse(q.answers || '[]'))
          .map((a: any) => ({ ...a, answer_uz_cyr: isRu ? a.answer_ru : a.answer_uz_cyr })),
      }))
      return json({ data: result })
    }

    return json({ error: 'invalid_action' }, 400)
  } catch (error) {
    console.error('preview-data error:', error)
    return json({ error: 'internal_error' }, 500)
  }
})
