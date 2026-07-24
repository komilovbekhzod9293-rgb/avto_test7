// Multicard.uz (branded to us as "Rahmat UZ") acquiring API client.
// Docs: https://docs.multicard.uz/ -- hosted-checkout flow only (no PCI DSS
// on our side): we create an invoice, redirect the customer to its
// checkout_url, and Multicard calls our webhook when the status changes.

const BASE_URL = Deno.env.get('MULTICARD_BASE_URL') ?? 'https://dev-mesh.multicard.uz'

// Token is valid 24h server-side; cache it for the lifetime of this warm
// instance instead of calling /auth on every request.
let cachedToken: { token: string; expiresAt: number } | null = null

async function getToken(): Promise<string> {
  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now) return cachedToken.token

  const application_id = Deno.env.get('MULTICARD_APPLICATION_ID')
  const secret = Deno.env.get('MULTICARD_SECRET')
  if (!application_id || !secret) {
    throw new Error('MULTICARD_APPLICATION_ID/MULTICARD_SECRET not configured')
  }

  const res = await fetch(`${BASE_URL}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ application_id, secret }),
  })
  const body = await res.json()
  if (!res.ok || !body.token) {
    throw new Error(`Multicard auth failed: ${res.status} ${JSON.stringify(body)}`)
  }

  // expiry is a GMT+5 timestamp string; simpler and safe to just cache for
  // 20h flat (well under the real 24h) rather than parse a tz-naive date.
  cachedToken = { token: body.token, expiresAt: now + 20 * 60 * 60 * 1000 }
  return body.token
}

export async function multicardRequest<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const json = await res.json()
  if (!res.ok || json.success === false) {
    throw new Error(`Multicard ${method} ${path} failed: ${res.status} ${JSON.stringify(json)}`)
  }
  return json.data as T
}

// Sums, not tiyin -- edge functions deal in whole UZS, this is the only
// place that knows the tiyin conversion.
export function sumToTiyin(sum: number): number {
  return Math.round(sum * 100)
}

export const TARIFFS: Record<string, { amountSum: number; name: string }> = {
  standard: { amountSum: 45_000, name: 'Тариф Стандарт (14 кун)' },
  pro: { amountSum: 70_000, name: 'Тариф Про (30 кун)' },
  max: { amountSum: 499_000, name: 'Тариф Макс (30 кун)' },
}

// PLACEHOLDER fiscal codes -- Multicard requires every invoice line to carry
// an MXIK (ИКПУ, tasnif.soliq.uz product/service classifier) and a package
// code. These are NOT real registered codes; good enough to exercise the
// sandbox, but MUST be replaced with the owner's real codes for
// "образовательные услуги" before any production invoice is created.
export const PLACEHOLDER_MXIK = '00000000000000000'
export const PLACEHOLDER_PACKAGE_CODE = '1'
