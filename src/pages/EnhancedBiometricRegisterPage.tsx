
import { MainLayout } from "@/components/layout/MainLayout";
import { EnhancedBiometricRegister } from "@/components/auth/EnhancedBiometricRegister";
import { Shield, Brain, Layers } from "lucide-react";

const EnhancedBiometricRegisterPage = () => {
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-vote-blue">Enhanced Biometric Registration</h1>
          <p className="text-gray-600 mt-2">
            Register with cutting-edge AI technology for maximum security and accuracy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
          <div className="md:col-span-2 order-2 md:order-1">
            <div className="bg-vote-light p-6 rounded-xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-vote-blue mb-4">Advanced Registration Process</h2>
                <p className="text-gray-600 mb-4">
                  Our enhanced registration captures multiple high-quality biometric samples 
                  with advanced AI analysis for unparalleled security.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center mb-2">
                    <Layers className="h-5 w-5 text-vote-teal mr-2" />
                    <h3 className="font-medium text-vote-blue">Multi-Sample Capture</h3>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• 7 high-resolution samples</li>
                    <li>• Different poses and expressions</li>
                    <li>• Quality validation for each sample</li>
                    <li>• Averaged template creation</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center mb-2">
                    <Brain className="h-5 w-5 text-vote-teal mr-2" />
                    <h3 className="font-medium text-vote-blue">AI-Powered Analysis</h3>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• TensorFlow.js machine learning</li>
                    <li>• 256-dimensional feature vectors</li>
                    <li>• Facial landmark mapping</li>
                    <li>• Advanced quality assessment</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 text-vote-teal mr-2" />
                    <h3 className="font-medium text-vote-blue">Security Validation</h3>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Real-time liveness checks</li>
                    <li>• Anti-spoofing verification</li>
                    <li>• Secure encrypted storage</li>
                    <li>• Privacy-preserving processing</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-teal-500 p-4 rounded-lg text-white">
                <h3 className="font-bold mb-2">Privacy Protection</h3>
                <p className="text-sm">
                  All biometric processing happens locally on your device. 
                  Only mathematical templates are stored - never actual images. 
                  Your privacy is our priority.
                </p>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-3 order-1 md:order-2 flex justify-center">
            <EnhancedBiometricRegister />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EnhancedBiometricRegisterPage;
