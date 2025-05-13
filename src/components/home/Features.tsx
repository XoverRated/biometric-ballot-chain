
import { SectionHeading } from "@/components/common/SectionHeading";
import { FeatureCard } from "@/components/common/FeatureCard";
import { FingerprintIcon, ShieldCheckIcon, SearchIcon, LockIcon, NetworkIcon, UserCheckIcon } from "lucide-react";

export const Features = () => {
  const features = [
    {
      icon: FingerprintIcon,
      title: "Biometric Authentication",
      description: "Secure voter verification using fingerprint and facial recognition technology.",
    },
    {
      icon: ShieldCheckIcon,
      title: "Blockchain Security",
      description: "Immutable blockchain record-keeping ensures votes can't be altered once cast.",
    },
    {
      icon: SearchIcon,
      title: "Transparent Verification",
      description: "Voters can verify their vote was counted correctly without compromising anonymity.",
    },
    {
      icon: LockIcon,
      title: "End-to-End Encryption",
      description: "All data is fully encrypted throughout the entire voting process.",
    },
    {
      icon: NetworkIcon,
      title: "Decentralization",
      description: "No single point of failure or control, enhancing security and trust.",
    },
    {
      icon: UserCheckIcon,
      title: "One Person, One Vote",
      description: "Eliminates duplicate voting and ensures voter identity integrity.",
    },
  ];

  return (
    <section className="py-16 bg-vote-gray">
      <div className="container mx-auto px-4">
        <SectionHeading
          title="Key Features"
          subtitle="Our platform combines cutting-edge biometric verification with blockchain technology to create a secure and transparent voting experience."
          centered
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
