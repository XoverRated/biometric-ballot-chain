
import { MainLayout } from "@/components/layout/MainLayout";
import { SimpleFingerprintRegister } from "@/components/auth/SimpleFingerprintRegister";

const SimpleFingerprintRegisterPage = () => {
  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <SimpleFingerprintRegister />
      </div>
    </MainLayout>
  );
};

export default SimpleFingerprintRegisterPage;
