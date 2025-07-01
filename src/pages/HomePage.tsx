
import { MainLayout } from "@/components/layout/MainLayout";
import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TrustBanner } from "@/components/home/TrustBanner";
import { CTASection } from "@/components/home/CTASection";

export const HomePage = () => {
  return (
    <MainLayout fullWidth>
      <Hero />
      <Features />
      <HowItWorks />
      <TrustBanner />
      <CTASection />
    </MainLayout>
  );
};
