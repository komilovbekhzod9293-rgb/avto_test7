export const BOT_USERNAME = 'pravaonaibot'

// Fire-and-forget alert to the owner's own Telegram chat (ADMIN_TELEGRAM_CHAT_ID
// env var) -- used for things that must never fail silently, like a paid
// customer's access grant not going through. No-ops quietly (just a console
// log) if the chat id isn't configured yet, so this is always safe to call.
export async function sendAdminAlert(text: string): Promise<void> {
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN')
  const chatId = Deno.env.get('ADMIN_TELEGRAM_CHAT_ID')
  if (!token || !chatId) {
    console.error('sendAdminAlert: TELEGRAM_BOT_TOKEN/ADMIN_TELEGRAM_CHAT_ID not configured, alert dropped:', text)
    return
  }
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    })
  } catch (err) {
    // An alert failing to send must never break the caller's own flow.
    console.error('sendAdminAlert: failed to send', err)
  }
}

// Use telegram.me rather than the short t.me domain: t.me is DNS-blocked
// (NXDOMAIN) on many Uzbek ISPs/DNS resolvers, so t.me/... links fail to
// open for a large share of our users during phone verification. telegram.me
// is Telegram's official equivalent domain, resolves where t.me doesn't, and
// supports the same ?start= deep-link parameter.
export function botUrlFor(verificationId: string): string {
  return `https://telegram.me/${BOT_USERNAME}?start=${verificationId}`
}
