
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ProcessStepCard } from "@/components/common/ProcessStepCard";
import { Link } from "react-router-dom";

export const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Register & Verify Identity",
      description: "Create an account and complete identity verification with your biometric data.",
    },
    {
      number: 2,
      title: "Access Ballot",
      description: "Sign in with your biometric data to access the secure ballot for your eligible elections.",
    },
    {
      number: 3,
      title: "Cast Your Vote",
      description: "Make your selections and submit your ballot, which is then encrypted and recorded.",
    },
    {
      number: 4,
      title: "Blockchain Confirmation",
      description: "Your vote is added to the blockchain with a unique verification code for your reference.",
    },
    {
      number: 5,
      title: "Verify Your Vote",
      description: "Use your verification code to confirm your vote was recorded accurately.",
    },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <SectionHeading
          title="How BiometricBallot Works"
          subtitle="Our secure electronic voting system combines ease of use with rigorous security measures."
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
          {steps.map((step, index) => (
            <ProcessStepCard
              key={index}
              number={step.number}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>

        <div className="text-center">
          <Link to="/how-it-works">
            <Button className="bg-vote-blue hover:bg-vote-teal text-white">
              Learn More About Our Process
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
