
import { MainLayout } from "@/components/layout/MainLayout";
import { FaceAuth } from "@/components/auth/FaceAuth";
import { Shield } from "lucide-react";

const FaceAuthPage = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-vote-blue">Face Recognition Verification</h1>
          <p className="text-gray-600 mt-2">
            Complete face verification to securely access your ballot
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
          <div className="md:col-span-2 order-2 md:order-1">
            <div className="bg-vote-light p-6 rounded-xl">
              <h2 className="text-xl font-bold text-vote-blue mb-4">Secure Face Verification</h2>
              <p className="text-gray-600 mb-4">
                Our advanced AI system verifies your identity by comparing your live face 
                with your registered biometric profile, ensuring maximum security.
              </p>
              
              <div className="bg-white p-4 rounded-lg border border-gray-100">
                <div className="flex items-center mb-2">
                  <Shield className="h-5 w-5 text-vote-teal mr-2" />
                  <h3 className="font-medium text-vote-blue">Security Features</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Live face detection prevents photo spoofing</li>
                  <li>• AI-powered similarity matching</li>
                  <li>• Confidence scoring for accuracy</li>
                  <li>• Multiple verification samples</li>
                  <li>• Real-time processing on your device</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-3 order-1 md:order-2 flex justify-center">
            <FaceAuth />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FaceAuthPage;
