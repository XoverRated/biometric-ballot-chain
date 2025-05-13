
import { MainLayout } from "@/components/layout/MainLayout";
import { VoteConfirmation } from "@/components/elections/VoteConfirmation";

const VoteConfirmationPage = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto flex justify-center">
        <VoteConfirmation />
      </div>
    </MainLayout>
  );
};

export default VoteConfirmationPage;
