import { useNavigate } from 'react-router-dom';
import { useLandingLang } from '@/hooks/useLandingLang';
import { LandingNav } from '@/components/landing/LandingNav';
import { Hero } from '@/components/landing/Hero';
import { StatsBar } from '@/components/landing/StatsBar';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Pricing } from '@/components/landing/Pricing';
import { Locations } from '@/components/landing/Locations';
import { Testimonials } from '@/components/landing/Testimonials';
import { Faq } from '@/components/landing/Faq';
import { Footer } from '@/components/landing/Footer';
import { AiConsultant } from '@/components/AiConsultant';

const LandingPage = () => {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLandingLang();

  return (
    <div className="min-h-screen overflow-x-hidden">
      <LandingNav t={t} lang={lang} setLang={setLang} onLogin={() => navigate('/auth')} />
      <Hero t={t} onFreeLesson={() => navigate('/auth')} onRegister={() => navigate('/auth')} />
      <StatsBar t={t} />
      <section id="features"><Features t={t} /></section>
      <HowItWorks t={t} />
      <section id="pricing"><Pricing t={t} onSelect={() => navigate('/auth')} /></section>
      <section id="locations"><Locations t={t} /></section>
      <Testimonials t={t} />
      <section id="faq"><Faq t={t} /></section>
      <Footer t={t} lang={lang} setLang={setLang} />
      <AiConsultant />
    </div>
  );
};

export default LandingPage;
