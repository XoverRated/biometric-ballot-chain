
import { MainLayout } from "@/components/layout/MainLayout";
import { BiometricRegister } from "@/components/auth/BiometricRegister"; // We'll create this next
import { ScanFaceIcon } from "lucide-react";

const BiometricRegisterPage = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-vote-blue">Facial Recognition Registration</h1>
          <p className="text-gray-600 mt-2">
            Secure your account by registering your facial recognition data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
          <div className="md:col-span-2 order-2 md:order-1">
            <div className="bg-vote-light p-6 rounded-xl">
              <h2 className="text-xl font-bold text-vote-blue mb-4">Why Register Facial Recognition?</h2>
              <p className="text-gray-600 mb-4">
                Registering your facial recognition data adds an extra layer of security to your account,
                making it much harder for unauthorized users to access your information.
              </p>
              
              <div className="bg-white p-4 rounded-lg border border-gray-100">
                <div className="flex items-center mb-2">
                  <ScanFaceIcon className="h-5 w-5 text-vote-teal mr-2" />
                  <h3 className="font-medium text-vote-blue">Security Benefits</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Enhanced account security</li>
                  <li>• Quick and easy facial authentication</li>
                  <li>• Protection against unauthorized access</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-3 order-1 md:order-2 flex justify-center">
            <BiometricRegister />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BiometricRegisterPage;
