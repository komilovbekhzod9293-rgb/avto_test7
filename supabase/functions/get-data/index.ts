import { corsHeaders } from '../_shared/cors.ts'
import { createDb } from '../_shared/db.ts'
import { validateSession } from '../_shared/session.ts'

const ALLOWED_ACTIONS = [
  'lessons', 'topics', 'all-topics', 'questions', 'questions-with-answers',
  'lesson', 'topic', 'random-final-test', 'traffic-signs'
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { action, lesson_id, topic_id, session_token, device_id, count } = body

    if (!action || !ALLOWED_ACTIONS.includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const extSupabase = createDb()
    const storageBaseUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/question-images`

    const session = await validateSession(extSupabase, session_token, device_id, req)
    if ('error' in session) {
      return new Response(
        JSON.stringify({ error: session.error }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // --- Trial gating ---------------------------------------------------------
    // Trial users (registered, not in allowed_phones) may only reach lesson 1 and
    // the Yakuniy test. Paid/full users and the shared lab account get everything.
    const isTrial = !session.user.fullAccess && !session.user.isShared

    const denyTrial = () => new Response(
      JSON.stringify({ error: 'trial_locked' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )

    const trialAllowedLessonIds = async (): Promise<Set<string>> => {
      const { data } = await extSupabase
        .from('lessons')
        .select('id, title, order_index')
        .order('order_index', { ascending: true })
      const s = new Set<string>()
      if (data && data.length) {
        s.add(data[0].id) // first lesson
        for (const l of data as any[]) if (/yakuniy|якуний/i.test(l.title || '')) s.add(l.id)
      }
      return s
    }

    if (isTrial) {
      if (action === 'topics' || action === 'lesson') {
        const allowed = await trialAllowedLessonIds()
        if (!lesson_id || !allowed.has(lesson_id)) return denyTrial()
      } else if (action === 'questions' || action === 'questions-with-answers' || action === 'topic') {
        if (!topic_id) return denyTrial()
        const { data: tp } = await extSupabase.from('topics').select('lesson_id').eq('id', topic_id).maybeSingle()
        const allowed = await trialAllowedLessonIds()
        if (!tp?.lesson_id || !allowed.has(tp.lesson_id)) return denyTrial()
      }
      // 'lessons', 'all-topics', 'traffic-signs', 'random-final-test' stay open to trial.
    }

    let result: any = null

    switch (action) {
      case 'lessons': {
        const { data, error } = await extSupabase
          .from('lessons')
          .select('id, title, order_index')
          .order('order_index', { ascending: true })
        if (error) throw error
        result = data
        break
      }

      case 'topics': {
        if (!lesson_id) {
          return new Response(
            JSON.stringify({ error: 'lesson_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        const { data, error } = await extSupabase
          .from('topics')
          .select('id, lesson_id, title_uz_cyr, order_index, youtube_url')
          .eq('lesson_id', lesson_id)
          .order('order_index', { ascending: true })
        if (error) throw error
        result = data
        break
      }

      case 'all-topics': {
        const { data, error } = await extSupabase
          .from('topics')
          .select('id, lesson_id, title_uz_cyr, order_index, youtube_url')
          .order('order_index', { ascending: true })
        if (error) throw error
        result = data
        break
      }

      case 'questions': {
        if (!topic_id) {
          return new Response(
            JSON.stringify({ error: 'topic_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        const { data, error } = await extSupabase
          .from('questions')
          .select('id, topic_id, question_uz_cyr, image_path, order_index')
          .eq('topic_id', topic_id)
          .order('order_index', { ascending: true })
        if (error) throw error
        result = (data || []).map((q: any) => ({
          ...q,
          image_url: q.image_path ? `${storageBaseUrl}/${q.image_path}` : null,
        }))
        break
      }

      case 'questions-with-answers': {
        if (!topic_id) {
          return new Response(
            JSON.stringify({ error: 'topic_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        const { data: questions, error: qErr } = await extSupabase
          .from('questions')
          .select('id, topic_id, question_uz_cyr, image_path, order_index')
          .eq('topic_id', topic_id)
          .order('order_index', { ascending: true })
        if (qErr) throw qErr
        if (!questions || questions.length === 0) { result = []; break }

        const qIds = questions.map((q: any) => q.id)
        const { data: answers, error: aErr } = await extSupabase
          .from('answers')
          .select('id, question_id, answer_uz_cyr, is_correct')
          .in('question_id', qIds)
        if (aErr) throw aErr

        result = questions.map((q: any) => ({
          ...q,
          image_url: q.image_path ? `${storageBaseUrl}/${q.image_path}` : null,
          answers: (answers || []).filter((a: any) => a.question_id === q.id),
        }))
        break
      }

      case 'lesson': {
        if (!lesson_id) {
          return new Response(
            JSON.stringify({ error: 'lesson_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        const { data, error } = await extSupabase
          .from('lessons')
          .select('id, title, order_index')
          .eq('id', lesson_id)
          .maybeSingle()
        if (error) throw error
        result = data
        break
      }

      case 'topic': {
        if (!topic_id) {
          return new Response(
            JSON.stringify({ error: 'topic_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        const { data, error } = await extSupabase
          .from('topics')
          .select('id, lesson_id, title_uz_cyr, order_index, youtube_url')
          .eq('id', topic_id)
          .maybeSingle()
        if (error) throw error
        result = data
        break
      }

      case 'traffic-signs': {
        const signsBaseUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/foydali%20malumotlar`
        const { data, error } = await extSupabase
          .from('traffic_signs')
          .select('id, number, category, title, description, image_path')
          .order('order_index', { ascending: true })
        if (error) throw error
        result = (data || []).map((s: any) => ({
          ...s,
          image_url: s.image_path ? `${signsBaseUrl}/${encodeURIComponent(s.image_path)}` : null,
        }))
        break
      }

      case 'random-final-test': {
        const ALLOWED_COUNTS = [20, 50, 100, 200]
        const questionCount = ALLOWED_COUNTS.includes(count) ? count : 20
        const { data, error } = await extSupabase.rpc('get_random_test_questions', { question_count: questionCount })
        if (error) throw error
        result = (data || []).map((q: any) => ({
          ...q,
          image_url: q.image_path ? `${storageBaseUrl}/${q.image_path}` : null,
          answers: Array.isArray(q.answers) ? q.answers : JSON.parse(q.answers || '[]'),
        }))
        break
      }
    }

    return new Response(
      JSON.stringify({ data: result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('get-data error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
