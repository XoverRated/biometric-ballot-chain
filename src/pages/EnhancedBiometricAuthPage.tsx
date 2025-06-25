
import { MainLayout } from "@/components/layout/MainLayout";
import { EnhancedBiometricAuth } from "@/components/auth/EnhancedBiometricAuth";
import { Shield, Zap, Eye } from "lucide-react";

const EnhancedBiometricAuthPage = () => {
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-vote-blue">Enhanced Biometric Authentication</h1>
          <p className="text-gray-600 mt-2">
            Advanced AI-powered security with multi-layer verification and anti-spoofing protection
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
          <div className="md:col-span-2 order-2 md:order-1">
            <div className="bg-vote-light p-6 rounded-xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-vote-blue mb-4">Advanced Security Layers</h2>
                <p className="text-gray-600 mb-4">
                  Our enhanced biometric system uses multiple AI-powered security layers 
                  to ensure maximum protection against sophisticated attacks.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center mb-2">
                    <Eye className="h-5 w-5 text-vote-teal mr-2" />
                    <h3 className="font-medium text-vote-blue">Liveness Detection</h3>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Real-time movement analysis</li>
                    <li>• Micro-expression detection</li>
                    <li>• Natural eye blink patterns</li>
                    <li>• Depth perception validation</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 text-vote-teal mr-2" />
                    <h3 className="font-medium text-vote-blue">Anti-Spoofing Technology</h3>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Photo attack prevention</li>
                    <li>• Video replay detection</li>
                    <li>• 3D mask identification</li>
                    <li>• Screen reflection analysis</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center mb-2">
                    <Zap className="h-5 w-5 text-vote-teal mr-2" />
                    <h3 className="font-medium text-vote-blue">Enhanced Matching</h3>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Multi-factor face comparison</li>
                    <li>• Facial landmark analysis</li>
                    <li>• Geometric consistency checks</li>
                    <li>• Confidence scoring algorithms</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-vote-blue to-vote-teal p-4 rounded-lg text-white">
                <h3 className="font-bold mb-2">Security Guarantee</h3>
                <p className="text-sm">
                  Our enhanced biometric system provides enterprise-grade security 
                  with 99.9% accuracy and comprehensive protection against all known 
                  spoofing attack vectors.
                </p>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-3 order-1 md:order-2 flex justify-center">
            <EnhancedBiometricAuth />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EnhancedBiometricAuthPage;
