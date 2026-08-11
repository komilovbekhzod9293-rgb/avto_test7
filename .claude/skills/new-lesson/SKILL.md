---
name: new-lesson
description: Add new lesson/topic/question/answer content (UZ and/or RU) to the avtotest7 (prava-on.com) Supabase database from source files (PPTX/exported question sets), with correct image compression, storage upload, and DB structure. Use when the owner provides new course material to add to a lesson, or asks to translate/add topics for the RU catalog.
---

# Adding new lesson content to avtotest7

This project's real content lives in Supabase project `ziqzprosgzevkdfwyotl` (org avtotest7 / prava-on.com) — NOT the project referenced in `.env`/`src/integrations/supabase/client.ts` (that one, `jvqnrzzkocslgwuminwf`, is unrelated and not owned by this project). Get a **Supabase Personal Access Token** from the user for all DB/storage work here (see `avtotest7-supabase-access` memory) — do not ask them to run SQL by hand.

## 0. Confirm scope and ordering BEFORE writing anything

Never guess order. Before inserting anything, explicitly ask the owner (or confirm from what they told you):
- Which lesson (and lesson `order_index`) this content belongs to.
- The order of topics within the lesson.
- The order of questions within each topic.
File order (alphabetical, folder order) is not a reliable default — always get explicit confirmation, or ask.

## 1. Source material convention

Reference source files live on the owner's Desktop, in `автотест7\{N}ый/ой/ий урок\`, one folder per lesson, one `.pptx` (or similar) file per **topic**. The file name is the topic's Russian title.

**Golden rule (established 2026-08-07): RU content must exactly match these source files — no more, no less.** Concretely:
- A topic gets a `title_ru` (and RU questions/answers) **only if** it has a real corresponding source file/material. Do not machine-translate or backfill RU content for topics that aren't in the source folder.
- Verified pattern across all 6 existing lessons: the count of topics with `title_ru` set exactly equals the file count in that lesson's folder (lesson 1: 5=5, lesson 6: 10=10, etc.) — keep this invariant true for any new lesson too.
- `get-data`'s `topics`/`all-topics` actions already filter out topics with `title_ru IS NULL` when `lang=ru` (as of the 2026-08-07 fix) — so an untranslated topic simply won't show to RU students. You do NOT need to hide it manually; just don't set `title_ru` for it.

## 2. Database structure

| Table | Columns that matter | Notes |
|---|---|---|
| `lessons` | `id, title, title_ru, order_index` | One row, bilingual (both languages on the same row). |
| `topics` | `id, lesson_id, title_uz_cyr, title_ru, order_index, youtube_url` | One row, bilingual. `title_ru` nullable = untranslated. |
| `questions` | `id, topic_id, question_uz_cyr, image_path, order_index` | **UZ only.** |
| `answers` | `id, question_id, answer_uz_cyr, is_correct` | **UZ only.** |
| `questions_ru` | `id, topic_id, question_ru, image_path, order_index` | **Separate table**, RU only — not a column on `questions`. |
| `answers_ru` | `id, question_id, answer_ru, is_correct` | **Separate table**, RU only. |

Questions/answers are **not** bilingual rows like topics/lessons — UZ and RU are entirely parallel tables, linked by the same `topic_id` convention but otherwise independent (a `questions_ru` row is not required to have a matching `questions` row and vice versa, though in practice they should describe the same underlying question).

**`is_correct` invariant:** exactly ONE answer per question must have `is_correct = true`, the rest `false`. Before inserting, double check your marking — a real bug already found and fixed once (2026-08-07): multiple answers on the same question all marked `true`. After inserting a batch, verify with:
```sql
select question_id, count(*) from answers where is_correct group by question_id having count(*) <> 1;
-- (and the same for answers_ru)
```

**Duplicate question text exists.** Multiple distinct questions (different images, different topics) can share identical question text (confirmed: "Ушбу кўрсатилган жойда тўхташга рухсат этиладими?" appears 3 times for 3 different photos). Never identify/match a question by text alone — always disambiguate by image and/or topic context.

## 3. Images: compress, then upload correctly

**Compression (always, before upload):** convert to **WebP, quality 80, max dimension 1600px**. This is the established standard for this project (both image buckets were migrated to it already) — typical result is 4–40 KB per image with no visible quality loss.

**Buckets** (public):
- `question-images` — UZ. Files live under a `webp/` **subfolder prefix** (e.g. `question-images/webp/004cd8b552174358.webp`). `image_path` stored in the DB is the path *within the bucket* (e.g. `webp/004cd8b552174358.webp`), matching what `get-data` does: `${storageBaseUrl}/${image_path}`.
- `question-images-ru` — RU. Files live at the bucket **root** (no `webp/` prefix) — this asymmetry with the UZ bucket is historical, just match it, don't try to unify it.
- Filenames are effectively random hex-ish strings — no meaningful naming convention to preserve; generating a random name per image is fine.

**Cache-Control is mandatory at upload time** — do not skip this like the original bulk upload did (it caused ~40% of the Pro plan's egress quota to go to re-downloading the same images over and over; fixed 2026-08-04 by re-uploading everything with a long cache header). Every new image upload must set `cache-control: max-age=31536000` (1 year) from the very first upload:

```bash
curl -X POST "https://ziqzprosgzevkdfwyotl.supabase.co/storage/v1/object/{bucket}/{path}" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "x-upsert: true" \
  -H "cache-control: max-age=31536000" \
  -H "Content-Type: image/webp" \
  --data-binary @image.webp
```
Fetch the service_role key via `GET /v1/projects/{ref}/api-keys?reveal=true` with the owner's Personal Access Token (no need to ask them for it separately).

## 4. Writing to the database

Use the Management API SQL endpoint: `POST https://api.supabase.com/v1/projects/ziqzprosgzevkdfwyotl/database/query` with `{"query": "..."}`, header `Authorization: Bearer <PAT>` **and `User-Agent: Mozilla/5.0`** (Cloudflare 1010-blocks requests without a User-Agent). Write multi-line SQL to a file and POST it via a small script (e.g. `json.dumps({'query': sql})` in Python) rather than inlining it in a shell heredoc — literal newlines can collapse and turn a `--` comment into one that silently eats the rest of the query.

Typical insert order for a new topic: `topics` row (get its `id`) → `questions`/`questions_ru` rows referencing that `topic_id` (get their `id`s) → `answers`/`answers_ru` rows referencing each `question_id`.

## 5. After inserting: verify, don't just assert

- Re-run the `is_correct` count-check above.
- Spot check topic/question counts against the source folder (see the invariant in step 1).
- If anything touches the frontend/edge functions (rare for pure data work), remember `npm run build`/`tsc --noEmit` before pushing, and that pushing to `main` auto-deploys both the site and edge functions via GitHub Actions.
