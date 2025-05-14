
import { MainLayout } from "@/components/layout/MainLayout";
import { FingerprintIcon, ShieldCheckIcon, UsersIcon, ZapIcon } from "lucide-react";

const AboutUsPage = () => {
  return (
    <MainLayout>
      <div className="py-16 bg-gradient-to-br from-vote-blue to-vote-teal">
        <div className="container mx-auto px-4 text-center">
          <FingerprintIcon className="h-20 w-20 text-white mx-auto mb-6 opacity-80" />
          <h1 className="text-5xl font-bold text-white mb-4">About BiometricBallot</h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Revolutionizing elections with secure, transparent, and accessible biometric voting technology.
          </p>
        </div>
      </div>

      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-vote-blue mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-gray-700 mb-10 text-center">
              At BiometricBallot, our mission is to empower democratic processes worldwide by providing an innovative electronic voting system that combines the robust security of biometric authentication with the transparency of modern ledger technologies. We aim to make voting more secure, accessible, and verifiable for everyone.
            </p>

            <div className="grid md:grid-cols-2 gap-10 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-lg border border-vote-light">
                <ZapIcon className="h-10 w-10 text-vote-accent mb-3" />
                <h3 className="text-xl font-semibold text-vote-blue mb-2">The System</h3>
                <p className="text-gray-600">
                  BiometricBallot is a state-of-the-art electronic voting platform. It leverages fingerprint biometrics to verify voter identity, ensuring that each vote is cast by the rightful, eligible individual. Once verified, votes are encrypted and recorded on a secure, often distributed, ledger. This process not only prevents fraud like impersonation and double voting but also allows for transparent auditing of election results without compromising voter anonymity.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border border-vote-light">
                <ShieldCheckIcon className="h-10 w-10 text-vote-accent mb-3" />
                <h3 className="text-xl font-semibold text-vote-blue mb-2">Our Vision</h3>
                <p className="text-gray-600">
                  We envision a future where every citizen can participate in elections with confidence, knowing their vote is secure, private, and accurately counted. By harnessing technology, we strive to eliminate barriers to voting and enhance trust in electoral outcomes.
                </p>
              </div>
            </div>
            
            <div className="text-center">
                <h3 className="text-2xl font-bold text-vote-blue mb-4">Join Us in Shaping the Future of Voting</h3>
                <p className="text-gray-700 max-w-2xl mx-auto">
                    BiometricBallot is more than just a platform; it's a commitment to stronger democracies. 
                    We are continuously innovating to ensure our system remains at the forefront of secure e-voting solutions.
                </p>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AboutUsPage;
