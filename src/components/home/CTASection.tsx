
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const CTASection = () => {
  return (
    <section className="py-20 blockchain-bg">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 lg:p-16 max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-vote-blue mb-6">
            Ready to Experience the Future of Voting?
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Join thousands of voters who have already experienced the security and convenience 
            of blockchain-based electronic voting with biometric verification.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="bg-vote-blue hover:bg-vote-teal text-white">
                Register to Vote
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button size="lg" variant="outline" className="border-vote-blue text-vote-blue hover:bg-vote-light">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
