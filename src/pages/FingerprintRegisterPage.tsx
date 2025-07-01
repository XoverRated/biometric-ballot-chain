
import { MainLayout } from "@/components/layout/MainLayout";
import { FingerprintRegister } from "@/components/auth/FingerprintRegister";

const FingerprintRegisterPage = () => {
  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <FingerprintRegister />
      </div>
    </MainLayout>
  );
};

export default FingerprintRegisterPage;
