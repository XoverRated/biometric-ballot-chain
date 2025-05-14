
import { MainLayout } from "@/components/layout/MainLayout";

const PrivacyPolicyPage = () => {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-12">
        <h1 className="text-4xl font-bold text-vote-blue mb-8 text-center">Privacy Policy</h1>
        <div className="prose lg:prose-xl text-gray-700">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <h2 className="text-2xl font-semibold text-vote-blue mt-6 mb-3">1. Introduction</h2>
          <p>
            Welcome to BiometricBallot. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us.
          </p>
          <h2 className="text-2xl font-semibold text-vote-blue mt-6 mb-3">2. Information We Collect</h2>
          <p>
            We collect personal information that you voluntarily provide to us when you register on the BiometricBallot, express an interest in obtaining information about us or our products and services, when you participate in activities on the BiometricBallot or otherwise when you contact us.
          </p>
          <p>
            The personal information that we collect depends on the context of your interactions with us and the BiometricBallot, the choices you make and the products and features you use. The personal information we collect may include the following:
          </p>
          <ul>
            <li>Personal Information Provided by You. We collect names; email addresses; passwords; contact preferences; contact or authentication data; and other similar information.</li>
            <li>Biometric Data. For verification purposes, we may process biometric data (e.g., fingerprint scans). This data is handled with the utmost security and is typically processed locally on your device or encrypted in transit if server-side verification is required.</li>
          </ul>
          <h2 className="text-2xl font-semibold text-vote-blue mt-6 mb-3">3. How We Use Your Information</h2>
          <p>
            We use personal information collected via our BiometricBallot for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
          </p>
          {/* Add more sections as needed */}
          <p className="mt-8">
            [More detailed privacy policy content would go here, covering data sharing, security, user rights, cookie policy, etc.]
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default PrivacyPolicyPage;
