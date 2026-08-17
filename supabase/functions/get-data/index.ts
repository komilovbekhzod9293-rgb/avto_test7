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
    const { action, lesson_id, topic_id, session_token, device_id, count, lang } = body
    const isRu = lang === 'ru'

    if (!action || !ALLOWED_ACTIONS.includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const extSupabase = createDb()
    const storageBaseUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/question-images`
    const storageBaseUrlRu = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/question-images-ru`

    const session = await validateSession(extSupabase, session_token, device_id, req)
    if ('error' in session) {
      return new Response(
        JSON.stringify({ error: session.error }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // --- Trial gating ---------------------------------------------------------
    // Trial users (registered, not in allowed_phones) may only reach lesson 1 --
    // including the Yakuniy (final test) lesson and random-final-test, which are
    // now paid-only too. Paid/full users and the shared lab account get everything.
    const isTrial = !session.user.fullAccess && !session.user.isShared
    // n8n deletes expired trial accounts on a schedule -- this is the
    // server-side backstop for the window before that run happens, so an
    // expired trial can't keep studying just because the row is still there.
    const isTrialExpired = isTrial && !!session.user.trialExpiresAt &&
      new Date(session.user.trialExpiresAt).getTime() < Date.now()

    const denyTrial = () => new Response(
      JSON.stringify({ error: 'trial_locked' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
    const denyTrialExpired = () => new Response(
      JSON.stringify({ error: 'trial_expired' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )

    const trialAllowedLessonIds = async (): Promise<Set<string>> => {
      const { data } = await extSupabase
        .from('lessons')
        .select('id, title, order_index')
        .order('order_index', { ascending: true })
      const s = new Set<string>()
      if (data && data.length) s.add(data[0].id) // first lesson only
      return s
    }

    if (isTrial) {
      if (isTrialExpired && action !== 'lessons' && action !== 'all-topics' && action !== 'traffic-signs') {
        return denyTrialExpired()
      }
      if (action === 'random-final-test') return denyTrial()
      if (action === 'topics' || action === 'lesson') {
        const allowed = await trialAllowedLessonIds()
        if (!lesson_id || !allowed.has(lesson_id)) return denyTrial()
      } else if (action === 'questions' || action === 'questions-with-answers' || action === 'topic') {
        if (!topic_id) return denyTrial()
        const { data: tp } = await extSupabase.from('topics').select('lesson_id').eq('id', topic_id).maybeSingle()
        const allowed = await trialAllowedLessonIds()
        if (!tp?.lesson_id || !allowed.has(tp.lesson_id)) return denyTrial()
      }
      // 'lessons', 'all-topics', 'traffic-signs' stay open to trial.
    }

    let result: any = null

    switch (action) {
      case 'lessons': {
        const { data, error } = await extSupabase
          .from('lessons')
          .select('id, title, title_ru, order_index')
          .order('order_index', { ascending: true })
        if (error) throw error
        result = (data || []).map((l: any) => ({ ...l, title: isRu && l.title_ru ? l.title_ru : l.title }))
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
          .select('id, lesson_id, title_uz_cyr, title_ru, order_index, youtube_url')
          .eq('lesson_id', lesson_id)
          .order('order_index', { ascending: true })
        if (error) throw error
        // RU students should only ever see topics that actually have RU
        // content -- an untranslated topic falling back to Uzbek text in an
        // otherwise-Russian list reads as broken/inconsistent, not helpful.
        const rows = isRu ? (data || []).filter((tp: any) => tp.title_ru) : (data || [])
        result = rows.map((tp: any) => ({ ...tp, title_uz_cyr: isRu ? tp.title_ru : tp.title_uz_cyr }))
        break
      }

      case 'all-topics': {
        const { data, error } = await extSupabase
          .from('topics')
          .select('id, lesson_id, title_uz_cyr, title_ru, order_index, youtube_url')
          .order('order_index', { ascending: true })
        if (error) throw error
        const rows = isRu ? (data || []).filter((tp: any) => tp.title_ru) : (data || [])
        result = rows.map((tp: any) => ({ ...tp, title_uz_cyr: isRu ? tp.title_ru : tp.title_uz_cyr }))
        break
      }

      case 'questions': {
        if (!topic_id) {
          return new Response(
            JSON.stringify({ error: 'topic_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        let { data, error } = await extSupabase
          .from(isRu ? 'questions_ru' : 'questions')
          .select(isRu ? 'id, topic_id, question_ru, image_path, order_index' : 'id, topic_id, question_uz_cyr, image_path, order_index')
          .eq('topic_id', topic_id)
          .order('order_index', { ascending: true })
        if (error) throw error
        // No RU content yet for this topic -- fall back to Uzbek rather than
        // showing an empty/broken-looking "0 questions" topic.
        let usedRu = isRu
        if (isRu && (!data || data.length === 0)) {
          usedRu = false
          const fb = await extSupabase
            .from('questions')
            .select('id, topic_id, question_uz_cyr, image_path, order_index')
            .eq('topic_id', topic_id)
            .order('order_index', { ascending: true })
          if (fb.error) throw fb.error
          data = fb.data
        }
        result = (data || []).map((q: any) => ({
          ...q,
          question_uz_cyr: usedRu ? q.question_ru : q.question_uz_cyr,
          image_url: q.image_path ? `${usedRu ? storageBaseUrlRu : storageBaseUrl}/${q.image_path}` : null,
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
        let { data: questions, error: qErr } = await extSupabase
          .from(isRu ? 'questions_ru' : 'questions')
          .select(isRu ? 'id, topic_id, question_ru, image_path, order_index' : 'id, topic_id, question_uz_cyr, image_path, order_index')
          .eq('topic_id', topic_id)
          .order('order_index', { ascending: true })
        if (qErr) throw qErr

        let usedRu = isRu
        if (isRu && (!questions || questions.length === 0)) {
          usedRu = false
          const fb = await extSupabase
            .from('questions')
            .select('id, topic_id, question_uz_cyr, image_path, order_index')
            .eq('topic_id', topic_id)
            .order('order_index', { ascending: true })
          if (fb.error) throw fb.error
          questions = fb.data
        }
        if (!questions || questions.length === 0) { result = []; break }

        const qIds = questions.map((q: any) => q.id)
        const { data: answers, error: aErr } = await extSupabase
          .from(usedRu ? 'answers_ru' : 'answers')
          .select(usedRu ? 'id, question_id, answer_ru, is_correct' : 'id, question_id, answer_uz_cyr, is_correct')
          .in('question_id', qIds)
        if (aErr) throw aErr

        result = questions.map((q: any) => ({
          ...q,
          question_uz_cyr: usedRu ? q.question_ru : q.question_uz_cyr,
          image_url: q.image_path ? `${usedRu ? storageBaseUrlRu : storageBaseUrl}/${q.image_path}` : null,
          answers: (answers || [])
            .filter((a: any) => a.question_id === q.id)
            .map((a: any) => ({ ...a, answer_uz_cyr: usedRu ? a.answer_ru : a.answer_uz_cyr })),
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
          .select('id, title, title_ru, order_index')
          .eq('id', lesson_id)
          .maybeSingle()
        if (error) throw error
        result = data ? { ...data, title: isRu && data.title_ru ? data.title_ru : data.title } : data
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
          .select('id, lesson_id, title_uz_cyr, title_ru, order_index, youtube_url')
          .eq('id', topic_id)
          .maybeSingle()
        if (error) throw error
        if (data) data.title_uz_cyr = isRu && data.title_ru ? data.title_ru : data.title_uz_cyr
        result = data
        break
      }

      case 'traffic-signs': {
        const signsBaseUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/foydali%20malumotlar`
        const { data, error } = await extSupabase
          .from('traffic_signs')
          .select('id, number, category, title, title_ru, description, description_ru, image_path')
          .order('order_index', { ascending: true })
        if (error) throw error
        result = (data || []).map((s: any) => ({
          ...s,
          title: isRu && s.title_ru ? s.title_ru : s.title,
          description: isRu && s.description_ru ? s.description_ru : s.description,
          image_url: s.image_path ? `${signsBaseUrl}/${encodeURIComponent(s.image_path)}` : null,
        }))
        break
      }

      case 'random-final-test': {
        const ALLOWED_COUNTS = [20, 50, 100, 200]
        const questionCount = ALLOWED_COUNTS.includes(count) ? count : 20
        const { data, error } = await extSupabase.rpc(
          isRu ? 'get_random_test_questions_ru' : 'get_random_test_questions',
          { question_count: questionCount }
        )
        if (error) throw error
        result = (data || []).map((q: any) => ({
          ...q,
          question_uz_cyr: isRu ? q.question_ru : q.question_uz_cyr,
          image_url: q.image_path ? `${isRu ? storageBaseUrlRu : storageBaseUrl}/${q.image_path}` : null,
          answers: (Array.isArray(q.answers) ? q.answers : JSON.parse(q.answers || '[]'))
            .map((a: any) => ({ ...a, answer_uz_cyr: isRu ? a.answer_ru : a.answer_uz_cyr })),
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
