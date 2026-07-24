// Push a one-off event to a single user's private topic instead of making
// every client poll an edge function on a timer. Uses Realtime's Broadcast
// REST endpoint (no websocket needed server-side -- a plain HTTP POST).
//
// There's no Supabase Auth in this app (custom app_users/session_token), so
// Realtime's RLS-based "private channel" authorization has nothing to check
// against -- `auth.uid()` is always null for our anon-key clients. We use a
// plain (non-private) channel named after the user's uuid instead: the
// channel name itself is the only "secret" (same trust model this app
// already uses everywhere else -- session_token is a bearer secret, not an
// RLS-scoped one). A uuid is not practically guessable, so this is
// consistent with, not weaker than, the rest of the auth model here.
export async function broadcastToUser(userId: string, event: string, payload: Record<string, unknown> = {}) {
  const url = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !serviceKey || !userId) return

  try {
    await fetch(`${url}/realtime/v1/api/broadcast`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ topic: `user-${userId}`, event, payload }],
      }),
    })
  } catch (err) {
    // A missed notification just means the client falls back to its slow
    // safety-net poll -- never let this break the actual operation.
    console.error('broadcastToUser failed:', err)
  }
}
