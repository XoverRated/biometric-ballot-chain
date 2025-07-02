import { MainLayout } from "@/components/layout/MainLayout";
import { FaceIOAuth } from "@/components/auth/FaceIOAuth";
import { Shield, Camera, Lock, Clock } from "lucide-react";

const FaceIOAuthPage = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-vote-blue">Face Authentication</h1>
          <p className="text-gray-600 mt-2">
            Verify your identity to securely access your voting portal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
          <div className="md:col-span-2 order-2 md:order-1">
            <div className="bg-vote-light p-6 rounded-xl">
              <h2 className="text-xl font-bold text-vote-blue mb-4">Secure Authentication</h2>
              <p className="text-gray-600 mb-4">
                Our advanced facial recognition system ensures only you can access your voting account.
              </p>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 text-vote-teal mr-2" />
                    <h3 className="font-medium text-vote-blue">Military-Grade Security</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Bank-level encryption and security protocols protect your biometric data.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center mb-2">
                    <Camera className="h-5 w-5 text-vote-teal mr-2" />
                    <h3 className="font-medium text-vote-blue">Real-Time Verification</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Instant face matching with your enrolled biometric template.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center mb-2">
                    <Lock className="h-5 w-5 text-vote-teal mr-2" />
                    <h3 className="font-medium text-vote-blue">Zero Storage</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your facial data is processed in real-time without permanent storage.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-vote-teal mr-2" />
                    <h3 className="font-medium text-vote-blue">Lightning Fast</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Authentication completed in under 2 seconds for seamless access.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-3 order-1 md:order-2 flex justify-center">
            <FaceIOAuth />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FaceIOAuthPage;