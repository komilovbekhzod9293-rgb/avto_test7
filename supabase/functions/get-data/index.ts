import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ALLOWED_ACTIONS = [
  'lessons', 'topics', 'all-topics', 'questions', 'questions-with-answers',
  'all-questions-with-answers', 'lesson', 'topic', 'random-final-test'
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { action, lesson_id, topic_id } = body

    if (!action || !ALLOWED_ACTIONS.includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const externalUrl = Deno.env.get('EXTERNAL_SUPABASE_URL')
    const externalKey = Deno.env.get('EXTERNAL_SUPABASE_SERVICE_KEY')

    if (!externalUrl || !externalKey) {
      console.error('External Supabase credentials not configured')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const extSupabase = createClient(externalUrl, externalKey)
    const storageBaseUrl = `${externalUrl}/storage/v1/object/public/question-images`

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
        // Add full image URLs
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

      case 'all-questions-with-answers': {
        const { data: questions, error: qErr } = await extSupabase
          .from('questions')
          .select('id, topic_id, question_uz_cyr, image_path, order_index')
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

      case 'random-final-test': {
        const { data, error } = await extSupabase.rpc('get_random_final_test_questions')
        if (error) throw error
        // Process results to add image URLs
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
