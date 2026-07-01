export function getLast9Digits(input: string): string {
  return (input || '').replace(/\D/g, '').slice(-9)
}
