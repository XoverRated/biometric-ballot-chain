import { FaceIOAuth } from "@/components/auth/FaceIOAuth";

const FaceIOAuthPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 text-white p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Face Authentication</h1>
        <p className="text-blue-100 max-w-lg">
          Verify your identity using facial recognition to access your secure voting portal.
        </p>
      </div>
      
      <FaceIOAuth />
    </div>
  );
};

export default FaceIOAuthPage;