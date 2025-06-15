
import { MainLayout } from "@/components/layout/MainLayout";
import { EnhancedFaceAuth } from "@/components/auth/EnhancedFaceAuth";
import { Shield, Zap, Eye, Lock, Users, AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { preloadTensorFlow } from "@/utils/lazyTensorFlow";
import { Alert, AlertDescription } from "@/components/ui/alert";

const EnhancedBiometricAuthPage = () => {
  useEffect(() => {
    preloadTensorFlow();
  }, []);

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-vote-blue">Enhanced Biometric Authentication</h1>
          <p className="text-gray-600 mt-2">
            Advanced AI-powered security with multi-layer verification and comprehensive protection
          </p>
        </div>

        <Alert className="mb-8">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Enhanced Security Features:</strong> Rate limiting, session management, backup authentication methods, 
            and comprehensive audit logging are now active for maximum security.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
          <div className="md:col-span-2 order-2 md:order-1">
            <div className="bg-vote-light p-6 rounded-xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-vote-blue mb-4">Multi-Layer Security System</h2>
                <p className="text-gray-600 mb-4">
                  Our enhanced biometric system now includes enterprise-grade security features 
                  for maximum protection against all attack vectors.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center mb-2">
                    <Eye className="h-5 w-5 text-vote-teal mr-2" />
                    <h3 className="font-medium text-vote-blue">Advanced Liveness Detection</h3>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Real-time movement analysis</li>
                    <li>• Micro-expression detection</li>
                    <li>• Anti-spoofing technology</li>
                    <li>• Depth perception validation</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center mb-2">
                    <Lock className="h-5 w-5 text-vote-teal mr-2" />
                    <h3 className="font-medium text-vote-blue">Security Controls</h3>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Rate limiting protection</li>
                    <li>• Session timeout management</li>
                    <li>• Account lockout policies</li>
                    <li>• Comprehensive audit logging</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center mb-2">
                    <Users className="h-5 w-5 text-vote-teal mr-2" />
                    <h3 className="font-medium text-vote-blue">Backup Authentication</h3>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Email verification codes</li>
                    <li>• SMS authentication</li>
                    <li>• Backup security codes</li>
                    <li>• Multi-factor options</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center mb-2">
                    <Zap className="h-5 w-5 text-vote-teal mr-2" />
                    <h3 className="font-medium text-vote-blue">Performance & Reliability</h3>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• TensorFlow.js optimization</li>
                    <li>• Progressive loading system</li>
                    <li>• Error recovery mechanisms</li>
                    <li>• Fallback authentication paths</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-vote-blue to-vote-teal p-4 rounded-lg text-white">
                <h3 className="font-bold mb-2">Enterprise-Grade Security</h3>
                <p className="text-sm">
                  Our enhanced biometric system now meets enterprise security standards 
                  with comprehensive protection, audit trails, and multiple authentication 
                  layers for maximum reliability.
                </p>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-3 order-1 md:order-2 flex justify-center">
            <EnhancedFaceAuth />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EnhancedBiometricAuthPage;
