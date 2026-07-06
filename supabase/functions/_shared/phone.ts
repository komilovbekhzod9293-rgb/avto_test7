export function getLast9Digits(input: string): string {
  return (input || '').replace(/\D/g, '').slice(-9)
}

// allowed_phones is filled in by hand and has inconsistent formatting (with/
// without +998, spaces, a stray extra digit, etc.) -- comparing on the full
// 9-digit subscriber number is brittle against that. The last 7 digits (the
// local number without the 2-digit operator prefix) tolerate that noise and
// still make an accidental collision between two different real phone
// numbers astronomically unlikely, so this is used only for "is this phone
// on the paid list" checks -- NOT for the Telegram contact-share identity
// check in telegram-webhook, which stays on the stricter getLast9Digits so
// proving control of a Telegram account still requires matching the number
// closely, not just its last 7 digits.
export function getLast7Digits(input: string): string {
  return (input || '').replace(/\D/g, '').slice(-7)
}
