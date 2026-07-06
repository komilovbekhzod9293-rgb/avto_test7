// Phone numbers are entered/stored with inconsistent formatting (+998 or
// not, spaces, a stray extra digit, different country codes, etc). Matching
// on the last 7 digits (the local subscriber number without country/operator
// prefix) tolerates that noise everywhere phones are compared: allowed_phones
// lookups, account lookups, and the Telegram contact-share identity check.
export function getLast7Digits(input: string): string {
  return (input || '').replace(/\D/g, '').slice(-7)
}
