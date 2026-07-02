import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { LandingDict } from '@/lib/i18n';

export function Faq({ t }: { t: LandingDict }) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-black text-center text-foreground mb-12">{t.faq.title}</h2>
        <div className="glass rounded-2xl px-2">
          <Accordion type="single" collapsible>
            {t.faq.items.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border/50">
                <AccordionTrigger className="text-left font-semibold text-foreground px-4">{item.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground px-4">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
