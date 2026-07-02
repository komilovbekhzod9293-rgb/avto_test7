import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { LandingDict } from '@/lib/i18n';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';

export function Faq({ t }: { t: LandingDict }) {
  return (
    <section className="py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <SectionHeading eyebrow="FAQ" title={t.faq.title} />
        <Reveal className="glass-card rounded-3xl px-2 sm:px-4">
          <Accordion type="single" collapsible>
            {t.faq.items.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border/40 last:border-0">
                <AccordionTrigger className="text-left font-bold text-foreground px-2 py-5 hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground px-2 leading-relaxed">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
