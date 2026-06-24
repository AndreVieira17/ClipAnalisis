import { Header } from '@/components/sections/Header';
import { Hero } from '@/components/sections/Hero';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { Analyzed } from '@/components/sections/Analyzed';
import { Plans } from '@/components/sections/Plans';
import { Social } from '@/components/sections/Social';
import { Faq } from '@/components/sections/Faq';
import { FinalCta } from '@/components/sections/FinalCta';
import { Footer } from '@/components/sections/Footer';
import { AnalyzerMount } from '@/components/analyze/AnalyzerMount';

export default function Landing() {
  return (
    <div className="grain relative">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Analyzed />
        <Plans />
        <Social />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <AnalyzerMount />
    </div>
  );
}
