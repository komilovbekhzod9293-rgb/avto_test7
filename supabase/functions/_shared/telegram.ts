export const BOT_USERNAME = 'pravaonaibot'

// Use telegram.me rather than the short t.me domain: t.me is DNS-blocked
// (NXDOMAIN) on many Uzbek ISPs/DNS resolvers, so t.me/... links fail to
// open for a large share of our users during phone verification. telegram.me
// is Telegram's official equivalent domain, resolves where t.me doesn't, and
// supports the same ?start= deep-link parameter.
export function botUrlFor(verificationId: string): string {
  return `https://telegram.me/${BOT_USERNAME}?start=${verificationId}`
}
