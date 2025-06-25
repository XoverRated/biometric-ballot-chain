
import { MainLayout } from "@/components/layout/MainLayout";
import { BiometricAuth } from "@/components/auth/BiometricAuth";
import { ShieldCheckIcon } from "lucide-react";

const BiometricAuthPage = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-vote-blue">Biometric Verification</h1>
          <p className="text-gray-600 mt-2">
            Complete the biometric verification to access your ballot
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
          <div className="md:col-span-2 order-2 md:order-1">
            <div className="bg-vote-light p-6 rounded-xl">
              <h2 className="text-xl font-bold text-vote-blue mb-4">Why Biometric Verification?</h2>
              <p className="text-gray-600 mb-4">
                Biometric verification ensures that only you can cast your vote, 
                preventing fraud and maintaining the integrity of the election.
              </p>
              
              <div className="bg-white p-4 rounded-lg border border-gray-100">
                <div className="flex items-center mb-2">
                  <ShieldCheckIcon className="h-5 w-5 text-vote-teal mr-2" />
                  <h3 className="font-medium text-vote-blue">Security Benefits</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Prevents impersonation and voter fraud</li>
                  <li>• Creates a non-transferable identity verification</li>
                  <li>• Ensures one-person-one-vote integrity</li>
                  <li>• Biometric data never leaves your device</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-3 order-1 md:order-2 flex justify-center">
            <BiometricAuth />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BiometricAuthPage;
