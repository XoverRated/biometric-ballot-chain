
import { MainLayout } from "@/components/layout/MainLayout";
import { FingerprintAuth } from "@/components/auth/FingerprintAuth";

const FingerprintAuthPage = () => {
  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <FingerprintAuth />
      </div>
    </MainLayout>
  );
};

export default FingerprintAuthPage;
