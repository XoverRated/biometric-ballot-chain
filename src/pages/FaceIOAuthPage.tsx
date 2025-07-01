import { MainLayout } from "@/components/layout/MainLayout";
import { FaceIOAuth } from "@/components/auth/FaceIOAuth";
import { Shield, Camera, Lock } from "lucide-react";

const FaceIOAuthPage = () => {
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-vote-blue">Facial Recognition Authentication</h1>
          <p className="text-gray-600 mt-2">
            Secure access to your voting portal using advanced facial recognition
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-vote-light p-6 rounded-xl">
              <h2 className="text-xl font-bold text-vote-blue mb-4">Secure Facial Authentication</h2>
              <p className="text-gray-600 mb-6">
                Our advanced facial recognition system provides secure, contactless authentication.
                Simply look at your camera to verify your identity and access your ballot.
              </p>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center mb-2">
                    <Camera className="h-5 w-5 text-vote-teal mr-2" />
                    <h3 className="font-medium text-vote-blue">Live Detection</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Real-time facial verification prevents spoofing and ensures authenticity
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 text-vote-teal mr-2" />
                    <h3 className="font-medium text-vote-blue">Privacy Protected</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    No images are stored - only encrypted mathematical signatures
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center mb-2">
                    <Lock className="h-5 w-5 text-vote-teal mr-2" />
                    <h3 className="font-medium text-vote-blue">Election Security</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Ensures one-person-one-vote integrity and prevents unauthorized access
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3 order-1 lg:order-2 flex justify-center">
            <FaceIOAuth />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FaceIOAuthPage;