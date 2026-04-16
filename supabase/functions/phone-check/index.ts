import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MAX_ATTEMPTS = 5
const WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours

async function hashValue(value: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(value + '_salt_phone_check_2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone } = await req.json()

    if (!phone || typeof phone !== 'string' || phone.trim().length < 5) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role for rate limiting table
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get client IP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown'

    const ipHash = await hashValue(clientIp)
    const phoneHash = await hashValue(phone.trim())
    const windowStart = new Date(Date.now() - WINDOW_MS).toISOString()

    // Check rate limits
    const { count: ipCount } = await supabase
      .from('phone_check_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('attempted_at', windowStart)

    if ((ipCount ?? 0) >= MAX_ATTEMPTS) {
      return new Response(
        JSON.stringify({ error: 'Too many attempts. Try again later.', rateLimited: true }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { count: phoneCount } = await supabase
      .from('phone_check_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('phone_hash', phoneHash)
      .gte('attempted_at', windowStart)

    if ((phoneCount ?? 0) >= MAX_ATTEMPTS) {
      return new Response(
        JSON.stringify({ error: 'Too many attempts for this number. Try again later.', rateLimited: true }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log attempt
    await supabase.from('phone_check_attempts').insert({
      ip_hash: ipHash,
      phone_hash: phoneHash,
    })

    // Call n8n webhook
    const webhookUrl = Deno.env.get('N8N_WEBHOOK_URL')
    if (!webhookUrl) {
      console.error('N8N_WEBHOOK_URL not configured')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone.trim() }),
    })

    const text = await response.text()
    console.log('n8n response:', text)
    
    let allowed = false
    try {
      const data = JSON.parse(text)
      const result = Array.isArray(data) ? data[0] : data
      allowed = result?.allowed === 'true' || result?.allowed === true
    } catch {
      console.error('Failed to parse n8n response:', text)
    }

    return new Response(
      JSON.stringify({ allowed }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Phone check error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
