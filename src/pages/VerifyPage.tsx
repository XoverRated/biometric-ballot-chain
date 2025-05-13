
import { MainLayout } from "@/components/layout/MainLayout";
import { VoteVerifier } from "@/components/verify/VoteVerifier";
import { SectionHeading } from "@/components/common/SectionHeading";
import { NetworkIcon } from "lucide-react";

const VerifyPage = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <SectionHeading
          title="Verify Your Vote"
          subtitle="Confirm that your vote was properly recorded on the blockchain"
          centered
        />
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
          <div className="md:col-span-2 order-2 md:order-1">
            <div className="bg-vote-light p-6 rounded-xl">
              <h2 className="text-xl font-bold text-vote-blue mb-4">Blockchain Verification</h2>
              <p className="text-gray-600 mb-4">
                Our blockchain system allows you to verify that your vote was correctly recorded 
                without compromising your anonymity.
              </p>
              
              <div className="bg-white p-4 rounded-lg mb-4">
                <div className="flex justify-center mb-4">
                  <NetworkIcon className="h-12 w-12 text-vote-teal" />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Your vote is securely stored on a distributed ledger that cannot be altered, 
                  ensuring the integrity of the election results.
                </p>
              </div>
              
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> The verification process only confirms that your vote was 
                recorded. To maintain ballot secrecy, there is no way to see which candidate you voted for.
              </p>
            </div>
          </div>
          
          <div className="md:col-span-3 order-1 md:order-2">
            <VoteVerifier />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default VerifyPage;
