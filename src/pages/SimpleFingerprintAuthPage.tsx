
import { MainLayout } from "@/components/layout/MainLayout";
import { SimpleFingerprintAuth } from "@/components/auth/SimpleFingerprintAuth";

const SimpleFingerprintAuthPage = () => {
  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <SimpleFingerprintAuth />
      </div>
    </MainLayout>
  );
};

export default SimpleFingerprintAuthPage;
