
import { MainLayout } from "@/components/layout/MainLayout";
import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TrustBanner } from "@/components/home/TrustBanner";
// ElectionsPreview is no longer imported
// import { ElectionsPreview } from "@/components/home/ElectionsPreview";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <MainLayout fullWidth>
      <Hero />
      <Features />
      <HowItWorks />
      <TrustBanner />
      {/* ElectionsPreview component is removed from here */}
      <CTASection />
    </MainLayout>
  );
};

export default Index;
