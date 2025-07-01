import { MainLayout } from "@/components/layout/MainLayout";
import { FaceIORegister } from "@/components/auth/FaceIORegister";
import { Camera, Shield, Zap } from "lucide-react";

const FaceIORegisterPage = () => {
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-vote-blue">FaceIO Registration</h1>
          <p className="text-gray-600 mt-2">
            Register your face for secure, passwordless authentication
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-vote-light p-6 rounded-xl">
              <h2 className="text-xl font-bold text-vote-blue mb-4">Advanced Facial Recognition</h2>
              <p className="text-gray-600 mb-6">
                FaceIO provides state-of-the-art facial recognition technology for secure and convenient authentication.
                Our system uses advanced AI to ensure accurate identification while maintaining your privacy.
              </p>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center mb-2">
                    <Camera className="h-5 w-5 text-vote-teal mr-2" />
                    <h3 className="font-medium text-vote-blue">Quick Setup</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    One-time registration process that takes just seconds to complete
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 text-vote-teal mr-2" />
                    <h3 className="font-medium text-vote-blue">Bank-Level Security</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your facial data is encrypted and stored with enterprise-grade security
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center mb-2">
                    <Zap className="h-5 w-5 text-vote-teal mr-2" />
                    <h3 className="font-medium text-vote-blue">Instant Access</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Future logins happen in seconds with just a look at your camera
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3 order-1 lg:order-2 flex justify-center">
            <FaceIORegister />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FaceIORegisterPage;