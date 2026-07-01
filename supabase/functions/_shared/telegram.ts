export const BOT_USERNAME = 'avtotest7aibot'

export function botUrlFor(verificationId: string): string {
  return `https://t.me/${BOT_USERNAME}?start=${verificationId}`
}
