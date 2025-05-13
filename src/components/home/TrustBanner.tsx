
import { ShieldIcon, CheckCircleIcon } from "lucide-react";

export const TrustBanner = () => {
  return (
    <section className="bg-vote-blue py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center text-white text-center md:text-left">
          <div className="mb-6 md:mb-0 md:mr-8">
            <ShieldIcon className="h-16 w-16 mx-auto md:mx-0" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Trusted, Secure, and Transparent</h2>
            <p className="text-gray-200 max-w-2xl">
              Our voting system is designed with security and transparency at its core. 
              Every vote is verifiable without compromising voter anonymity, ensuring election integrity.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>Independent Security Audits</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>Open Source Verification</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>End-to-End Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
