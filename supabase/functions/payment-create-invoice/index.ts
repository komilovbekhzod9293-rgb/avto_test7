import { corsHeaders } from '../_shared/cors.ts'
import { createDb } from '../_shared/db.ts'
import { validateSession } from '../_shared/session.ts'
import { multicardRequest, sumToTiyin, TARIFFS, PLACEHOLDER_MXIK, PLACEHOLDER_PACKAGE_CODE } from '../_shared/multicard.ts'

const SITE_URL = 'https://prava-on.com/#/profile'
const WEBHOOK_URL = 'https://ziqzprosgzevkdfwyotl.supabase.co/functions/v1/payment-webhook'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { session_token, device_id, tariff, first_name, last_name } = await req.json()

    if (
      !first_name || typeof first_name !== 'string' || !first_name.trim() ||
      !last_name || typeof last_name !== 'string' || !last_name.trim()
    ) {
      return json({ error: 'invalid_input' }, 400)
    }

    const db = createDb()
    const session = await validateSession(db, session_token, device_id, req)
    if ('error' in session) return json({ error: session.error }, 401)

    const plan = TARIFFS[tariff]
    if (!plan) return json({ error: 'invalid_tariff' }, 400)

    const invoice_id = `pon-${crypto.randomUUID()}`
    const amountTiyin = sumToTiyin(plan.amountSum)
    const storeId = Number(Deno.env.get('MULTICARD_STORE_ID'))
    if (!storeId) return json({ error: 'internal_error' }, 500)

    const invoice = await multicardRequest<{ uuid: string; checkout_url: string }>(
      'POST',
      '/payment/invoice',
      {
        store_id: storeId,
        amount: amountTiyin,
        invoice_id,
        callback_url: WEBHOOK_URL,
        return_url: `${SITE_URL}?payment=success`,
        return_error_url: `${SITE_URL}?payment=failed`,
        lang: 'ru',
        ofd: [
          {
            qty: 1,
            price: amountTiyin,
            total: amountTiyin,
            mxik: PLACEHOLDER_MXIK,
            package_code: PLACEHOLDER_PACKAGE_CODE,
            name: plan.name,
          },
        ],
      },
    )

    const { error: insertErr } = await db.from('payments').insert({
      invoice_id,
      multicard_uuid: invoice.uuid,
      user_id: session.user.id,
      phone: session.user.phone,
      first_name: first_name.trim().slice(0, 100),
      last_name: last_name.trim().slice(0, 100),
      tariff,
      amount: amountTiyin,
      status: 'draft',
      checkout_url: invoice.checkout_url,
    })
    if (insertErr) throw insertErr

    return json({ data: { checkout_url: invoice.checkout_url, invoice_id } })
  } catch (error) {
    console.error('payment-create-invoice error:', error)
    return json({ error: 'internal_error' }, 500)
  }
})
