const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
      // Handle both single object and array responses
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
