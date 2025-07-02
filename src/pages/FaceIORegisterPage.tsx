import { FaceIORegister } from "@/components/auth/FaceIORegister";

const FaceIORegisterPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 text-white p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Face Registration</h1>
        <p className="text-blue-100 max-w-lg">
          Register your face for secure biometric authentication. This ensures only you can access your voting account.
        </p>
      </div>
      
      <FaceIORegister />
    </div>
  );
};

export default FaceIORegisterPage;