import { useEffect, useRef, useState } from 'react';
import { X, ArrowUp, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getConsultantLang, sendToConsultant, type AiMessage, type Lang, type ConsultantVariant } from '@/lib/aiConsultant';
import { compressImageToJpeg, blobToBase64 } from '@/lib/imageCompress';
import { safeStorage } from '@/lib/safeStorage';

const DICT: Record<Lang, {
  title: string; subtitle: string; online: string; greeting: string; placeholder: string; error: string; launcher: string;
  studentTitle: string; studentGreeting: string; studentLauncher: string;
}> = {
  uz: {
    title: 'AI konsultant', subtitle: 'Odatda bir zumda javob beradi', online: 'onlayn',
    greeting: "Assalomu alaykum! Men Prava On yordamchisiman. Kurslar, narxlar yoki platforma haqida nimani bilmoqchisiz?",
    placeholder: 'Xabar yozing...', error: "Kechirasiz, ulanishda xatolik. Birozdan so'ng urinib ko'ring.", launcher: 'AI konsultant',
    studentTitle: 'Yordamchi', studentLauncher: 'Yordam',
    studentGreeting: "Assalomu alaykum! Kirish, ro'yxatdan o'tish, raqamni tasdiqlash yoki darslarga kirishda yordam beraman. Muammoingizni yozing — istasangiz skrinshot ham yuboring.",
  },
  ru: {
    title: 'ИИ консультант', subtitle: 'Обычно отвечает мгновенно', online: 'онлайн',
    greeting: 'Здравствуйте! Я ассистент Prava On. Что хотите узнать о курсах, ценах или платформе?',
    placeholder: 'Напишите сообщение...', error: 'Извините, ошибка соединения. Попробуйте чуть позже.', launcher: 'ИИ консультант',
    studentTitle: 'Помощник', studentLauncher: 'Помощь',
    studentGreeting: 'Здравствуйте! Помогу со входом, регистрацией, подтверждением номера и доступом к урокам. Опишите, что происходит — можно прислать скриншот.',
  },
  en: {
    title: 'AI consultant', subtitle: 'Usually replies instantly', online: 'online',
    greeting: "Hi! I'm the Prava On assistant. What would you like to know about the courses, pricing or the platform?",
    placeholder: 'Type a message...', error: 'Sorry, a connection error occurred. Please try again shortly.', launcher: 'AI consultant',
    studentTitle: 'Student help', studentLauncher: 'Help',
    studentGreeting: "Hi! I can help with login, registration, phone verification and access to lessons. Tell me what's happening — you can also send a screenshot.",
  },
};

// A perpetually drifting electronic sine wave — the "we see & hear you" motion.
function Waveform({ className }: { className?: string }) {
  const path = 'M0 16 Q 15 2 30 16 T 60 16 T 90 16 T 120 16 T 150 16 T 180 16 T 210 16 T 240 16';
  return (
    <svg viewBox="0 0 240 32" preserveAspectRatio="none" className={cn('w-full h-full', className)} aria-hidden>
      <g className="animate-wave">
        <path d={path} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <path d={path} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" opacity="0.7" transform="translate(240 0)" />
      </g>
      <g className="animate-wave-2">
        <path d={path} fill="none" stroke="hsl(var(--primary) / 0.5)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" transform="translate(0 4)" />
        <path d={path} fill="none" stroke="hsl(var(--primary) / 0.5)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" transform="translate(240 4)" />
      </g>
    </svg>
  );
}

function Equalizer({ className, color = 'currentColor' }: { className?: string; color?: string }) {
  const delays = ['0ms', '180ms', '360ms', '120ms', '260ms'];
  return (
    <span className={cn('flex items-end gap-[3px] h-5', className)} aria-hidden>
      {delays.map((d, i) => (
        <span key={i} className="eq-bar w-[3px] h-full rounded-full" style={{ background: color, animationDelay: d }} />
      ))}
    </span>
  );
}

const CHAT_TTL = 1000 * 60 * 60 * 24; // keep the conversation for 24h

function loadMessages(greeting: string, key: string): AiMessage[] {
  try {
    const raw = safeStorage.getItem(key);
    if (raw) {
      const saved = JSON.parse(raw) as { ts: number; messages: AiMessage[] };
      if (Date.now() - saved.ts < CHAT_TTL && Array.isArray(saved.messages) && saved.messages.length) {
        return saved.messages;
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  return [{ role: 'assistant', text: greeting }];
}

export function AiConsultant({ variant = 'sales' }: { variant?: ConsultantVariant } = {}) {
  const [open, setOpen] = useState(false);
  const [lang] = useState<Lang>(() => getConsultantLang());
  const t = DICT[lang];
  const isStudent = variant === 'student';
  const greeting = isStudent ? t.studentGreeting : t.greeting;
  const title = isStudent ? t.studentTitle : t.title;
  const launcherLabel = isStudent ? t.studentLauncher : t.launcher;
  const chatKey = `ai_consultant_chat_${variant}`;
  const [messages, setMessages] = useState<AiMessage[]>(() => loadMessages(greeting, chatKey));

  // Persist the conversation so closing/reopening (or a remount) keeps history.
  // Attached screenshots are dropped from the stored copy on purpose: they are
  // base64 blobs that would fill the origin's localStorage quota and then make
  // *other* writes (session, progress) throw.
  useEffect(() => {
    try {
      const light = messages.map(({ role, text }) => ({ role, text }));
      safeStorage.setItem(chatKey, JSON.stringify({ ts: Date.now(), messages: light }));
    } catch {
      /* ignore quota errors */
    }
  }, [messages, chatKey]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [attaching, setAttaching] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const pickImage = async (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    setAttaching(true);
    try {
      // 1024px keeps screenshot text readable while staying small (~100KB) so
      // the vision request is cheap.
      const blob = await compressImageToJpeg(file, 1024, 0.72);
      setPendingImage(await blobToBase64(blob));
    } catch {
      /* ignore unreadable files */
    } finally {
      setAttaching(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open]);

  const send = async () => {
    const text = input.trim();
    const image = pendingImage;
    if ((!text && !image) || sending) return;
    const history = messages;
    setMessages((m) => [...m, { role: 'user', text, ...(image ? { image } : {}) }]);
    setInput('');
    setPendingImage(null);
    setSending(true);
    try {
      const reply = await sendToConsultant(variant, text, history, image);
      setMessages((m) => [...m, { role: 'assistant', text: reply }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', text: t.error }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 left-4 z-50 flex items-center gap-3 group"
          aria-label={launcherLabel}
        >
          <span className="pulse-ring relative w-14 h-14 rounded-full glass-strong flex items-center justify-center text-primary transition-transform group-hover:scale-105">
            <Equalizer color="hsl(var(--primary))" />
          </span>
          <span className="hidden sm:flex items-center gap-2 glass-strong rounded-full pl-3 pr-4 py-2 shadow-xl">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="text-sm font-bold text-foreground">{launcherLabel}</span>
          </span>
        </button>
      )}

      {/* chat panel */}
      {open && (
        <div className="fixed z-50 inset-x-2 top-14 bottom-2 sm:inset-auto sm:left-4 sm:bottom-4 sm:top-auto sm:w-[440px] sm:h-[min(680px,88vh)] flex flex-col glass-strong rounded-[1.75rem] overflow-hidden shadow-2xl border border-border/50">
          {/* header */}
          <div className="relative shrink-0 px-4 pt-4 pb-3 border-b border-border/40">
            <div className="absolute inset-x-0 bottom-0 h-8 opacity-70 pointer-events-none">
              <Waveform />
            </div>
            <div className="relative flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center text-primary shrink-0">
                <Equalizer color="hsl(var(--primary))" className="h-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-display font-extrabold text-foreground leading-tight">{title}</p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-success" />
                  {t.online} · {t.subtitle}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* messages */}
          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap break-words',
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'glass-card text-foreground rounded-bl-md',
                  )}
                >
                  {m.image && (
                    <img
                      src={m.image}
                      alt=""
                      className="mb-1.5 max-h-48 w-auto rounded-xl border border-white/15"
                    />
                  )}
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/70 eq-bar" style={{ animationDelay: `${i * 160}ms` }} />
                    ))}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ambient wave above input */}
          <div className="shrink-0 h-6 px-2 opacity-50 pointer-events-none">
            <Waveform />
          </div>

          {/* input — text + optional screenshot attachment */}
          <div className="shrink-0 p-3 pt-0">
            {/* pending screenshot preview */}
            {pendingImage && (
              <div className="mb-2 flex items-center gap-2 glass-card rounded-2xl p-2 w-fit max-w-full">
                <img src={pendingImage} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <button
                  onClick={() => setPendingImage(null)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 glass-card rounded-full pl-2 pr-1.5 py-1.5">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pickImage(e.target.files?.[0])}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={attaching || sending}
                className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors shrink-0 disabled:opacity-40"
                aria-label="Attach screenshot"
              >
                <Paperclip className="w-[18px] h-[18px]" />
              </button>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={t.placeholder}
                aria-label={t.placeholder}
                maxLength={1000}
                className="flex-1 min-w-0 bg-transparent outline-none text-[14px] text-foreground placeholder:text-muted-foreground py-1.5"
              />
              <button
                onClick={send}
                disabled={(!input.trim() && !pendingImage) || sending}
                className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 transition-all disabled:opacity-40 enabled:hover:scale-105"
                aria-label="Send"
              >
                <ArrowUp className="w-4 h-4" strokeWidth={2.75} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
