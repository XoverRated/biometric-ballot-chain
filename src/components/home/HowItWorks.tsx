
import { Card, CardContent } from "@/components/ui/card";
import { UserCheckIcon, FingerprintIcon, VoteIcon, ShieldCheckIcon } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UserCheckIcon,
    title: "Register & Verify",
    description: "Create your account and complete biometric registration with facial recognition or fingerprint scanning.",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    step: "02", 
    icon: FingerprintIcon,
    title: "Biometric Authentication",
    description: "Access your ballot using secure biometric authentication - no passwords needed.",
    color: "from-teal-500 to-teal-600",
    bgColor: "bg-teal-50"
  },
  {
    step: "03",
    icon: VoteIcon,
    title: "Cast Your Vote",
    description: "Make your selections on our intuitive digital ballot with real-time validation.",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50"
  },
  {
    step: "04",
    icon: ShieldCheckIcon,
    title: "Blockchain Verification",
    description: "Your vote is encrypted and permanently recorded on the blockchain for complete transparency.",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50"
  }
];

export const HowItWorks = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-vote-light to-white rounded-full text-vote-blue font-semibold text-sm mb-6 border border-vote-blue/20">
            <VoteIcon className="h-4 w-4" />
            Simple Process
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How BiometricBallot Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our streamlined process makes secure voting accessible to everyone while maintaining 
            the highest levels of security and transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection lines for desktop */}
          <div className="hidden lg:block absolute top-20 left-1/2 transform -translate-x-1/2 w-full max-w-6xl">
            <div className="flex justify-between items-center px-20">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 mx-4"></div>
              ))}
            </div>
          </div>

          {steps.map((step, index) => (
            <Card 
              key={index}
              className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-md hover:-translate-y-3 bg-white relative"
            >
              <CardContent className="p-8 text-center relative">
                {/* Step number */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${step.color} text-white font-bold text-sm flex items-center justify-center shadow-lg`}>
                    {step.step}
                  </div>
                </div>

                <div className={`w-20 h-20 ${step.bgColor} rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-all duration-300 mt-4`}>
                  <step.icon className={`h-10 w-10 text-${step.color.split('-')[1]}-600`} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-vote-blue transition-colors">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>

                <div className={`h-1 w-0 group-hover:w-full bg-gradient-to-r ${step.color} mt-6 transition-all duration-500 rounded-full mx-auto`}></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Security guarantee */}
        <div className="mt-20 text-center">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-vote-light to-white p-8 rounded-2xl border border-vote-blue/20">
            <div className="flex items-center justify-center mb-4">
              <ShieldCheckIcon className="h-8 w-8 text-vote-blue mr-3" />
              <h3 className="text-2xl font-bold text-vote-blue">Security Guarantee</h3>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              Every step is protected by military-grade encryption, multi-factor authentication, 
              and blockchain immutability. Your vote is secure, private, and verifiable.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
