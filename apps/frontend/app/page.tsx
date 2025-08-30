import { Hero } from '@/components/home/hero';
import { HowItWorks } from '@/components/home/how-it-works';
import { FeaturedListings } from '@/components/home/featured-listings';
import { TrustSignals } from '@/components/home/trust-signals';
import { CTASection } from '@/components/home/cta-section';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <HowItWorks />
      <FeaturedListings />
      <TrustSignals />
      <CTASection />
    </div>
  );
}
