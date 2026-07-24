import { corsHeaders } from '../_shared/cors.ts'
import { createDb } from '../_shared/db.ts'

// ONE-OFF maintenance tool: the question-images / foydali malumotlar
// buckets were populated by hand through the Supabase dashboard, which
// leaves the default short Cache-Control on every object -- students
// re-download the same quiz/sign images on every visit instead of the
// browser caching them, which is most of what pushed Cached Egress to 41%
// of the Pro plan quota. This re-uploads each object in place (same bytes,
// same path) with a 1-year Cache-Control so it only gets fetched once per
// browser instead of every page load.
//
// Gated by the existing CONSULTANT_LOOKUP_SECRET (no new secret needed) via
// header x-admin-secret. Not meant to stay in the function list long-term --
// delete once run.
//
// POST { action: 'list', bucket } -> counts + how many already have a long cache
// POST { action: 'fix', bucket, limit? } -> re-uploads up to `limit` (default 200)
//   objects that don't already have a long cache-control; returns how many it
//   touched so it can be called again for the rest if the bucket is large.

const LONG_CACHE = '31536000' // 1 year, seconds
const BUCKETS = ['question-images', 'foydali malumotlar', 'avatars']

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function hasLongCache(cacheControl: string | undefined): boolean {
  if (!cacheControl) return false
  const match = cacheControl.match(/max-age=(\d+)/)
  return !!match && Number(match[1]) >= 30 * 24 * 60 * 60 // treat 30d+ as "already fine"
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const secret = Deno.env.get('CONSULTANT_LOOKUP_SECRET')
  if (!secret || req.headers.get('x-admin-secret') !== secret) {
    return json({ error: 'unauthorized' }, 401)
  }

  try {
    const { action, bucket, limit } = await req.json()
    if (!BUCKETS.includes(bucket)) return json({ error: 'invalid_bucket', allowed: BUCKETS }, 400)

    const db = createDb()

    // Recursively walk every "folder" in the bucket -- Storage's list() is
    // one level at a time, and question-images/foydali malumotlar are
    // organized in subfolders.
    async function listAll(prefix: string): Promise<{ path: string; cacheControl?: string }[]> {
      const { data, error } = await db.storage.from(bucket).list(prefix, { limit: 1000 })
      if (error) throw error
      const out: { path: string; cacheControl?: string }[] = []
      for (const entry of data || []) {
        const path = prefix ? `${prefix}/${entry.name}` : entry.name
        if (entry.id === null) {
          // A "folder" placeholder has no id -- recurse into it.
          out.push(...(await listAll(path)))
        } else {
          out.push({ path, cacheControl: (entry.metadata as { cacheControl?: string } | null)?.cacheControl })
        }
      }
      return out
    }

    const all = await listAll('')
    const stale = all.filter((f) => !hasLongCache(f.cacheControl))

    if (action === 'list') {
      return json({
        data: { bucket, total: all.length, already_long_cache: all.length - stale.length, needs_fix: stale.length },
      })
    }

    if (action === 'fix') {
      const batch = stale.slice(0, typeof limit === 'number' && limit > 0 ? limit : 200)
      let fixed = 0
      const errors: string[] = []

      for (const file of batch) {
        try {
          const { data: blob, error: dlErr } = await db.storage.from(bucket).download(file.path)
          if (dlErr || !blob) throw dlErr ?? new Error('empty download')

          const { error: upErr } = await db.storage
            .from(bucket)
            .upload(file.path, blob, { upsert: true, cacheControl: LONG_CACHE, contentType: blob.type || undefined })
          if (upErr) throw upErr

          fixed++
        } catch (fileErr) {
          errors.push(`${file.path}: ${String(fileErr)}`)
        }
      }

      return json({
        data: { bucket, fixed, remaining: stale.length - fixed, errors: errors.slice(0, 10) },
      })
    }

    return json({ error: 'invalid_action' }, 400)
  } catch (error) {
    console.error('admin-storage-cache-fix error:', error)
    return json({ error: 'internal_error', detail: String(error) }, 500)
  }
})
