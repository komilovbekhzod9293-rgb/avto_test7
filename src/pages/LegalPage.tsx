import { useLandingLang } from '@/hooks/useLandingLang';
import { PageShell } from '@/components/PageShell';
import { LangSwitcher } from '@/components/landing/LangSwitcher';

// Public offer and privacy policy share the same layout — only the dict key differs.
export default function LegalPage({ type }: { type: 'offer' | 'privacy' }) {
  const { lang, setLang, t } = useLandingLang();
  const content = t.legalPages[type];

  return (
    <div className="min-h-screen relative">
      <div className="landing-glow" aria-hidden />
      <PageShell title={content.title} actions={<LangSwitcher lang={lang} setLang={setLang} />}>
        <p className="text-sm text-muted-foreground mb-8">{content.updated}</p>
        <div className="space-y-8">
          {content.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display font-bold text-lg text-foreground mb-3">{section.heading}</h2>
              <div className="space-y-3">
                {section.body.map((paragraph, i) => (
                  <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </PageShell>
    </div>
  );
}
