
import { MainLayout } from "@/components/layout/MainLayout";

const TermsOfServicePage = () => {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-12">
        <h1 className="text-4xl font-bold text-vote-blue mb-8 text-center">Terms of Service</h1>
        <div className="prose lg:prose-xl text-gray-700">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <h2 className="text-2xl font-semibold text-vote-blue mt-6 mb-3">1. Agreement to Terms</h2>
          <p>
            By using BiometricBallot (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, then you do not have permission to access the Service.
          </p>
          <h2 className="text-2xl font-semibold text-vote-blue mt-6 mb-3">2. Use of Service</h2>
          <p>
            You agree to use the Service only for lawful purposes and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the Service. Prohibited behavior includes harassing or causing distress or inconvenience to any other user, transmitting obscene or offensive content or disrupting the normal flow of dialogue within the Service.
          </p>
          <h2 className="text-2xl font-semibold text-vote-blue mt-6 mb-3">3. Accounts</h2>
          <p>
            When you create an account with us, you guarantee that the information you provide us is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on the Service.
          </p>
          {/* Add more sections as needed */}
          <p className="mt-8">
            [More detailed terms of service content would go here, covering intellectual property, termination, limitation of liability, governing law, changes to terms, etc.]
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default TermsOfServicePage;
