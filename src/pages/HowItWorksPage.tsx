
import { MainLayout } from "@/components/layout/MainLayout";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ProcessStepCard } from "@/components/common/ProcessStepCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FingerprintIcon, ShieldCheckIcon, LockIcon, NetworkIcon, VoteIcon, SearchIcon } from "lucide-react";

const HowItWorksPage = () => {
  const votingSteps = [
    {
      number: 1,
      title: "Register & Verify Identity",
      description: "Create an account and complete identity verification with your government ID and biometric data.",
    },
    {
      number: 2,
      title: "Secure Authentication",
      description: "Sign in with your credentials and verify your identity with biometric authentication.",
    },
    {
      number: 3,
      title: "Access Your Ballot",
      description: "View eligible elections and access your personalized, secure digital ballot.",
    },
    {
      number: 4,
      title: "Make Your Selections",
      description: "Select your preferred candidates or choices for each position or measure.",
    },
    {
      number: 5,
      title: "Review & Submit",
      description: "Review your selections carefully before submitting your final vote.",
    },
    {
      number: 6,
      title: "Blockchain Confirmation",
      description: "Receive confirmation that your vote was securely recorded on the blockchain.",
    },
  ];

  const verificationSteps = [
    {
      number: 1,
      title: "Receive Vote Receipt",
      description: "After casting your vote, you'll receive a unique verification code.",
    },
    {
      number: 2,
      title: "Visit Verification Portal",
      description: "Access the vote verification portal on our platform.",
    },
    {
      number: 3,
      title: "Enter Your Code",
      description: "Input your verification code to lookup your vote record.",
    },
    {
      number: 4,
      title: "Verify Blockchain Record",
      description: "Confirm that your vote was recorded correctly in the blockchain.",
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          title="How BiometricBallot Works"
          subtitle="Our secure electronic voting system combines biometric verification with blockchain technology to ensure security, transparency, and accessibility."
          centered
        />

        <Tabs defaultValue="voting" className="w-full mb-16">
          <TabsList className="grid w-full grid-cols-2 mb-8 max-w-md mx-auto">
            <TabsTrigger value="voting">Voting Process</TabsTrigger>
            <TabsTrigger value="verification">Vote Verification</TabsTrigger>
          </TabsList>
          
          <TabsContent value="voting">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
              {votingSteps.map((step, index) => (
                <ProcessStepCard
                  key={index}
                  number={step.number}
                  title={step.title}
                  description={step.description}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="verification">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto mb-12">
              {verificationSteps.map((step, index) => (
                <ProcessStepCard
                  key={index}
                  number={step.number}
                  title={step.title}
                  description={step.description}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-center mb-6">
              <div className="bg-vote-light p-3 rounded-full">
                <FingerprintIcon className="h-8 w-8 text-vote-teal" />
              </div>
              <h2 className="text-2xl font-bold text-vote-blue ml-4">Biometric Security</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Our system uses advanced biometric verification to ensure that only registered voters can access their ballots, eliminating the possibility of impersonation or fraudulent voting.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-vote-teal mr-2">•</span>
                <span>Fingerprint and facial recognition</span>
              </li>
              <li className="flex items-start">
                <span className="text-vote-teal mr-2">•</span>
                <span>Encrypted biometric data storage</span>
              </li>
              <li className="flex items-start">
                <span className="text-vote-teal mr-2">•</span>
                <span>Multi-factor authentication</span>
              </li>
              <li className="flex items-start">
                <span className="text-vote-teal mr-2">•</span>
                <span>Zero-knowledge proofs for privacy</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-center mb-6">
              <div className="bg-vote-light p-3 rounded-full">
                <NetworkIcon className="h-8 w-8 text-vote-teal" />
              </div>
              <h2 className="text-2xl font-bold text-vote-blue ml-4">Blockchain Technology</h2>
            </div>
            <p className="text-gray-600 mb-6">
              We leverage blockchain technology to create an immutable, transparent record of all votes, ensuring that once cast, votes cannot be altered, deleted, or tampered with in any way.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-vote-teal mr-2">•</span>
                <span>Decentralized vote storage</span>
              </li>
              <li className="flex items-start">
                <span className="text-vote-teal mr-2">•</span>
                <span>Cryptographic vote security</span>
              </li>
              <li className="flex items-start">
                <span className="text-vote-teal mr-2">•</span>
                <span>Transparent yet anonymous records</span>
              </li>
              <li className="flex items-start">
                <span className="text-vote-teal mr-2">•</span>
                <span>Real-time result tabulation</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-vote-blue text-white p-8 md:p-12 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Security Measures</h2>
              <p className="mb-6">
                Our platform implements multiple layers of security to protect voter data, ballot integrity, and election results.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <ShieldCheckIcon className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">End-to-End Encryption</h3>
                    <p className="text-gray-200 text-sm">All data is encrypted throughout the entire voting process</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <LockIcon className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Secure Infrastructure</h3>
                    <p className="text-gray-200 text-sm">Hosting on distributed secure servers with regular security audits</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <VoteIcon className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Vote Privacy</h3>
                    <p className="text-gray-200 text-sm">Separation of identity verification from vote recording</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-4">Transparency & Auditability</h2>
              <p className="mb-6">
                Our system is designed to be fully transparent and auditable, allowing for independent verification of election results.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <SearchIcon className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Public Blockchain Explorer</h3>
                    <p className="text-gray-200 text-sm">Anyone can verify the integrity of the blockchain records</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <NetworkIcon className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Distributed Consensus</h3>
                    <p className="text-gray-200 text-sm">Multiple independent nodes validate and confirm each transaction</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ShieldCheckIcon className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Independent Audits</h3>
                    <p className="text-gray-200 text-sm">Regular third-party security and process audits</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HowItWorksPage;
