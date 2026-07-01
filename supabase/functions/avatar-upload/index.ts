import { corsHeaders } from '../_shared/cors.ts'
import { createDb } from '../_shared/db.ts'
import { validateSession } from '../_shared/session.ts'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

const MAX_BYTES = 300 * 1024 // guard against abuse; compressed avatars should land well under this

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { session_token, device_id, image_base64 } = await req.json()
    if (!image_base64 || typeof image_base64 !== 'string') return json({ error: 'invalid_input' }, 400)

    const db = createDb()
    const session = await validateSession(db, session_token, device_id)
    if ('error' in session) return json({ error: session.error }, 401)
    const userId = session.user.id

    const base64Data = image_base64.includes(',') ? image_base64.split(',')[1] : image_base64
    const bytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))
    if (bytes.byteLength > MAX_BYTES) return json({ error: 'image_too_large' }, 413)

    const path = `${userId}.jpg`
    const { error: uploadErr } = await db.storage
      .from('avatars')
      .upload(path, bytes, { contentType: 'image/jpeg', upsert: true })
    if (uploadErr) throw uploadErr

    const { data: publicUrlData } = db.storage.from('avatars').getPublicUrl(path)
    const avatarUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`

    const { error: updateErr } = await db.from('app_users').update({ avatar_url: avatarUrl }).eq('id', userId)
    if (updateErr) throw updateErr

    return json({ data: { avatar_url: avatarUrl } })
  } catch (error) {
    console.error('avatar-upload error:', error)
    return json({ error: 'internal_error' }, 500)
  }
})
