
import { MainLayout } from "@/components/layout/MainLayout";
import { ShieldCheckIcon, LockKeyholeIcon, FingerprintIcon } from "lucide-react";

const securityFeatures = [
  {
    icon: FingerprintIcon,
    title: "Biometric Authentication",
    description: "Utilizes your unique fingerprint for secure login and vote casting, ensuring only you can access your ballot."
  },
  {
    icon: LockKeyholeIcon,
    title: "End-to-End Encryption",
    description: "All sensitive data, including your vote and personal information, is encrypted during transmission and at rest."
  },
  {
    icon: ShieldCheckIcon,
    title: "Immutable Ledger (Blockchain)",
    description: "Votes are recorded on a distributed ledger, making them tamper-proof and publicly verifiable without compromising anonymity."
  },
];

const SecurityInfoPage = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-12">
        <h1 className="text-4xl font-bold text-vote-blue mb-12 text-center">Our Commitment to Security</h1>
        <div className="grid md:grid-cols-3 gap-8">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg text-center border border-vote-light hover:shadow-xl transition-shadow">
              <feature.icon className="h-12 w-12 text-vote-teal mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-vote-blue mb-2">{feature.title}</h2>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center prose lg:prose-xl mx-auto text-gray-700">
          <h2 className="text-2xl font-semibold text-vote-blue mt-6 mb-3">Data Protection</h2>
          <p>
            We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems, and are required to keep the information confidential.
          </p>
          <h2 className="text-2xl font-semibold text-vote-blue mt-6 mb-3">Continuous Monitoring</h2>
          <p>
            Our systems are continuously monitored for potential vulnerabilities and attacks. We are dedicated to ensuring the highest level of security for our electronic voting platform.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default SecurityInfoPage;
