import { useNavigate } from 'react-router-dom';
import { useLandingLang } from '@/hooks/useLandingLang';
import { LandingNav } from '@/components/landing/LandingNav';
import { Hero } from '@/components/landing/Hero';
import { StatsBar } from '@/components/landing/StatsBar';
import { ProblemSolution } from '@/components/landing/ProblemSolution';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Pricing } from '@/components/landing/Pricing';
import { Locations } from '@/components/landing/Locations';
import { Testimonials } from '@/components/landing/Testimonials';
import { Faq } from '@/components/landing/Faq';
import { Footer } from '@/components/landing/Footer';

const LandingPage = () => {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLandingLang();

  return (
    <div className="min-h-screen">
      <LandingNav t={t} onLogin={() => navigate('/auth')} />
      <Hero t={t} onFreeLesson={() => navigate('/preview/lesson')} onRegister={() => navigate('/auth')} />
      <StatsBar t={t} />
      <ProblemSolution t={t} />
      <Features t={t} />
      <HowItWorks t={t} />
      <Pricing t={t} onSelect={() => navigate('/auth')} />
      <Locations t={t} />
      <Testimonials t={t} />
      <Faq t={t} />
      <Footer t={t} lang={lang} setLang={setLang} />
    </div>
  );
};

export default LandingPage;
