import type { Metadata } from 'next';
import HeroSection from '@/components/sections/HeroSection';
import AboutPreview from '@/components/sections/AboutPreview';
import FeaturedServices from '@/components/sections/FeaturedServices';
import PopularPackages from '@/components/sections/PopularPackages';
import StatsSection from '@/components/sections/StatsSection';
import Testimonials from '@/components/sections/Testimonials';
import OurExperts from '@/components/sections/OurExperts';
import GalleryPreview from '@/components/sections/GalleryPreview';
import WhyChooseUs from '@/components/sections/WhyChooseUs';
import FAQSection from '@/components/sections/FAQSection';
import NewsletterSection from '@/components/sections/NewsletterSection';

export const metadata: Metadata = {
  title: 'Glow Beauty Studio – Where Beauty Meets Perfection',
  description: 'Premium luxury beauty salon offering hair care, skin treatments, bridal makeup, spa services and more. Book your appointment today!',
};

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <AboutPreview />
      <FeaturedServices />
      <StatsSection />
      <PopularPackages />
      <OurExperts />
      <GalleryPreview />
      <Testimonials />
      <WhyChooseUs />
      <FAQSection />
      <NewsletterSection />
    </div>
  );
}
