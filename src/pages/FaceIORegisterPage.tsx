import { MainLayout } from "@/components/layout/MainLayout";
import { FaceIORegister } from "@/components/auth/FaceIORegister";
import { Camera, Shield, Users, Lock } from "lucide-react";

const FaceIORegisterPage = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-vote-blue">FaceIO Registration</h1>
          <p className="text-gray-600 mt-2">
            Register your face for secure and convenient biometric authentication
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
          <div className="md:col-span-2 order-2 md:order-1">
            <div className="bg-vote-light p-6 rounded-xl">
              <h2 className="text-xl font-bold text-vote-blue mb-4">Advanced Face Recognition</h2>
              <p className="text-gray-600 mb-4">
                Our FaceIO integration provides enterprise-grade facial recognition technology with advanced security features.
              </p>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center mb-2">
                    <Camera className="h-5 w-5 text-vote-teal mr-2" />
                    <h3 className="font-medium text-vote-blue">AI-Powered Recognition</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    State-of-the-art machine learning algorithms for accurate face detection and verification.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 text-vote-teal mr-2" />
                    <h3 className="font-medium text-vote-blue">Liveness Detection</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Advanced anti-spoofing technology prevents attacks using photos or videos.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center mb-2">
                    <Lock className="h-5 w-5 text-vote-teal mr-2" />
                    <h3 className="font-medium text-vote-blue">GDPR Compliant</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Full compliance with privacy regulations and secure data handling.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center mb-2">
                    <Users className="h-5 w-5 text-vote-teal mr-2" />
                    <h3 className="font-medium text-vote-blue">Cross-Platform</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Works seamlessly across all devices and browsers with camera access.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-3 order-1 md:order-2 flex justify-center">
            <FaceIORegister />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FaceIORegisterPage;