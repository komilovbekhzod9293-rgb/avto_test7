-- Online payment via Multicard.uz (Rahmat UZ acquiring). One row per invoice
-- we create; updated as Multicard's webhook reports status changes.
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id text not null unique, -- our correlation id, sent to Multicard and echoed back
  multicard_uuid text, -- Multicard's own transaction id, set once the invoice is created
  user_id uuid references public.app_users(id),
  phone text,
  tariff text not null,
  amount integer not null, -- tiyin
  status text not null default 'draft', -- draft/progress/success/error/revert/canceled
  checkout_url text,
  last_webhook jsonb, -- most recent callback payload, kept for debugging during the test phase
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payments enable row level security;
-- No policies: service-role only (edge functions), same as client_errors.

create index payments_invoice_id_idx on public.payments (invoice_id);
create index payments_user_id_idx on public.payments (user_id);
