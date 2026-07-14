import { createDb } from '../_shared/db.ts'
import { getLast7Digits } from '../_shared/phone.ts'

const SITE_URL = 'https://prava-on.com/#/auth'

// Embedding verification_id in the return link means the site can resume
// the right flow purely from the URL -- works even if the phone's browser
// opens the link in a brand new tab (losing any in-page/session state),
// which is common on Android when returning from the Telegram app.
function returnToSiteMarkup(verificationId?: string) {
  const url = verificationId ? `${SITE_URL}?verify=${verificationId}` : SITE_URL
  return { inline_keyboard: [[{ text: '🌐 Сайтга қайтиш', url }]] }
}

async function sendMessage(chatId: number | string, text: string, extra: Record<string, unknown> = {}) {
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN')
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, ...extra }),
  })
}

Deno.serve(async (req) => {
  try {
    // Optional webhook authentication: once TELEGRAM_WEBHOOK_SECRET is set (in the
    // function's env) AND registered via setWebhook(secret_token=...), reject any
    // request that doesn't carry the matching header. Until then this is a no-op,
    // so the bot keeps working unchanged.
    const webhookSecret = Deno.env.get('TELEGRAM_WEBHOOK_SECRET')
    if (webhookSecret && req.headers.get('x-telegram-bot-api-secret-token') !== webhookSecret) {
      return new Response('unauthorized', { status: 401 })
    }

    const update = await req.json()
    const db = createDb()
    const message = update.message

    if (!message) return new Response('ok')

    const chatId = message.chat.id

    // /start <verification_id> deep link -> ask user to share their contact
    if (typeof message.text === 'string' && message.text.startsWith('/start')) {
      const verificationId = message.text.split(' ')[1]?.trim()
      if (!verificationId) {
        await sendMessage(chatId, 'Илтимос, сайтдаги ҳаволадан ўтинг.')
        return new Response('ok')
      }

      const { data: row } = await db
        .from('phone_verifications')
        .select('id, expires_at, verified')
        .eq('id', verificationId)
        .maybeSingle()

      if (!row || row.verified || new Date(row.expires_at).getTime() < Date.now()) {
        await sendMessage(chatId, 'Havola eskirgan yoki noto‘g‘ri. Saytga qaytib qayta urinib ko‘ring.', {
          reply_markup: returnToSiteMarkup(),
        })
        return new Response('ok')
      }

      await db.from('phone_verifications').update({ telegram_chat_id: String(chatId) }).eq('id', verificationId)

      await sendMessage(chatId, 'Телефон рақамингизни тасдиқлаш учун қуйидаги тугмани босинг:', {
        reply_markup: {
          keyboard: [[{ text: '📱 Рақамни юбориш', request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      })
      return new Response('ok')
    }

    // User tapped "share contact"
    if (message.contact) {
      if (message.contact.user_id !== message.from.id) {
        await sendMessage(chatId, 'Илтимос, фақат ўзингизнинг рақамингизни улашинг.', {
          reply_markup: returnToSiteMarkup(),
        })
        return new Response('ok')
      }

      const { data: pending } = await db
        .from('phone_verifications')
        .select('id, phone, expires_at')
        .eq('telegram_chat_id', String(chatId))
        .eq('verified', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!pending || new Date(pending.expires_at).getTime() < Date.now()) {
        await sendMessage(chatId, 'Тасдиқлаш сессияси топилмади ёки муддати ўтган. Сайтга қайтиб қайта уриниб кўринг.', {
          reply_markup: returnToSiteMarkup(),
        })
        return new Response('ok')
      }

      const sharedLast7 = getLast7Digits(message.contact.phone_number)
      const expectedLast7 = getLast7Digits(pending.phone)

      if (sharedLast7 !== expectedLast7) {
        await sendMessage(
          chatId,
          'Бу рақам сайтда киритилган рақам билан мос келмади. Илтимос, сайтда киритилган рақамдан фойдаланинг.',
          { reply_markup: returnToSiteMarkup(pending.id) },
        )
        return new Response('ok')
      }

      await db.from('phone_verifications').update({ verified: true }).eq('id', pending.id)
      await sendMessage(chatId, '✅ Рақамингиз тасдиқланди! Давом этиш учун тугмани босинг:', {
        reply_markup: returnToSiteMarkup(pending.id),
      })
      return new Response('ok')
    }

    return new Response('ok')
  } catch (error) {
    console.error('telegram-webhook error:', error)
    return new Response('ok') // always 200 so Telegram doesn't retry-storm us
  }
})
