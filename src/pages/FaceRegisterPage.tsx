
import { MainLayout } from "@/components/layout/MainLayout";
import { FaceRegister } from "@/components/auth/FaceRegister";
import { Camera } from "lucide-react";

const FaceRegisterPage = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-vote-blue">Face Recognition Registration</h1>
          <p className="text-gray-600 mt-2">
            Register your face for secure biometric authentication using advanced AI technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
          <div className="md:col-span-2 order-2 md:order-1">
            <div className="bg-vote-light p-6 rounded-xl">
              <h2 className="text-xl font-bold text-vote-blue mb-4">Advanced Face Recognition</h2>
              <p className="text-gray-600 mb-4">
                Our AI-powered face recognition system uses TensorFlow.js and machine learning 
                to create a secure biometric profile unique to you.
              </p>
              
              <div className="bg-white p-4 rounded-lg border border-gray-100">
                <div className="flex items-center mb-2">
                  <Camera className="h-5 w-5 text-vote-teal mr-2" />
                  <h3 className="font-medium text-vote-blue">How It Works</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• AI analyzes your facial features and landmarks</li>
                  <li>• Creates a unique mathematical representation</li>
                  <li>• Data never leaves your device during processing</li>
                  <li>• Instant verification in future logins</li>
                  <li>• Works in various lighting conditions</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-3 order-1 md:order-2 flex justify-center">
            <FaceRegister />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FaceRegisterPage;
