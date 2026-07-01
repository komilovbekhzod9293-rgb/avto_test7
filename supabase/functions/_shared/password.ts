const DEFAULT_ITERATIONS = 100_000
const KEY_LENGTH_BITS = 256

function toHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function fromHex(hex: string): Uint8Array {
  return Uint8Array.from(hex.match(/.{2}/g)!.map((b) => parseInt(b, 16)))
}

async function deriveHash(password: string, salt: Uint8Array, iterations: number): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    KEY_LENGTH_BITS,
  )
  return toHex(new Uint8Array(bits))
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hashHex = await deriveHash(password, salt, DEFAULT_ITERATIONS)
  return `${DEFAULT_ITERATIONS}$${toHex(salt)}$${hashHex}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [iterStr, saltHex, hashHex] = stored.split('$')
  if (!iterStr || !saltHex || !hashHex) return false
  const salt = fromHex(saltHex)
  const recomputed = await deriveHash(password, salt, parseInt(iterStr, 10))
  return recomputed === hashHex
}
