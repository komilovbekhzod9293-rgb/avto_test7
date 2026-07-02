// AI consultant configuration + transport.
//
// The n8n webhook URL is not wired yet — the owner will provide it later.
// Put it here (or set VITE_AI_WEBHOOK_URL at build time) and the chat starts
// talking to the agent automatically. Until then, a graceful local fallback
// reply is shown so the widget still works.
export const AI_WEBHOOK_URL: string =
  (import.meta.env.VITE_AI_WEBHOOK_URL as string | undefined) ??
  'https://n8n.srv1215497.hstgr.cloud/webhook/avtotest7-consultant';

const UID_KEY = 'ai_consultant_uid';

// Stable per-visitor id — this is the id the owner asked for so n8n can key the
// conversation memory to a user. Tied to the account login when available.
export function getConsultantUserId(): string {
  let id = localStorage.getItem(UID_KEY);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(UID_KEY, id);
  }
  return id;
}

export type Lang = 'uz' | 'ru' | 'en';

export function getConsultantLang(): Lang {
  const l = localStorage.getItem('landing_lang');
  return l === 'ru' || l === 'en' ? l : 'uz';
}

export interface AiMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface SendPayload {
  userId: string;
  login: string | null;
  lang: Lang;
  message: string;
  history: AiMessage[];
  ts: number;
}

// Extract the assistant text from whatever shape n8n returns.
function parseReply(data: unknown): string | null {
  if (!data) return null;
  if (typeof data === 'string') return data;
  const d = data as Record<string, unknown>;
  const cand =
    d.reply ?? d.output ?? d.text ?? d.message ?? d.answer ?? (Array.isArray(data) ? (data[0] as never) : null);
  if (typeof cand === 'string') return cand;
  if (cand && typeof cand === 'object') {
    const c = cand as Record<string, unknown>;
    if (typeof c.output === 'string') return c.output;
    if (typeof c.text === 'string') return c.text;
  }
  return null;
}

export async function sendToConsultant(message: string, history: AiMessage[]): Promise<string> {
  const payload: SendPayload = {
    userId: getConsultantUserId(),
    login: localStorage.getItem('login'),
    lang: getConsultantLang(),
    message,
    history,
    ts: Date.now(),
  };

  if (!AI_WEBHOOK_URL) {
    // No webhook yet — friendly placeholder so the experience isn't broken.
    await new Promise((r) => setTimeout(r, 700));
    const fallback: Record<Lang, string> = {
      uz: "Rahmat! Savolingiz qabul qilindi. Konsultantimiz tez orada siz bilan bog'lanadi. Batafsil ma'lumot uchun: +998 55 513 27 77 yoki Telegram @avto_test7.",
      ru: 'Спасибо! Ваш вопрос принят. Наш консультант скоро свяжется с вами. Подробнее: +998 55 513 27 77 или Telegram @avto_test7.',
      en: 'Thank you! Your question has been received. Our consultant will contact you shortly. More info: +998 55 513 27 77 or Telegram @avto_test7.',
    };
    return fallback[payload.lang];
  }

  const res = await fetch(AI_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`AI webhook ${res.status}`);
  const data = await res.json().catch(() => null);
  return parseReply(data) ?? '…';
}
