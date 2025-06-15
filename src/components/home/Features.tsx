
import { ShieldCheckIcon, FingerprintIcon, ChainIcon, EyeIcon, LockIcon, GlobeIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: FingerprintIcon,
    title: "Biometric Authentication",
    description: "Advanced facial recognition and fingerprint scanning ensure only verified voters can participate.",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600"
  },
  {
    icon: ChainIcon,
    title: "Blockchain Security", 
    description: "Every vote is cryptographically secured and stored on an immutable blockchain ledger.",
    color: "from-teal-500 to-teal-600",
    bgColor: "bg-teal-50",
    iconColor: "text-teal-600"
  },
  {
    icon: EyeIcon,
    title: "Complete Transparency",
    description: "Real-time results and public verification ensure complete election transparency.",
    color: "from-green-500 to-green-600", 
    bgColor: "bg-green-50",
    iconColor: "text-green-600"
  },
  {
    icon: LockIcon,
    title: "Privacy Protected",
    description: "Your vote remains anonymous while maintaining full auditability and verification.",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50", 
    iconColor: "text-purple-600"
  },
  {
    icon: ShieldCheckIcon,
    title: "Military-Grade Security",
    description: "End-to-end encryption and multi-layer security protect against all attack vectors.",
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
    iconColor: "text-red-600"
  },
  {
    icon: GlobeIcon,
    title: "Global Accessibility",
    description: "Vote from anywhere in the world with our mobile-first, accessible platform.",
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50",
    iconColor: "text-indigo-600"
  }
];

export const Features = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-vote-light rounded-full text-vote-blue font-semibold text-sm mb-6">
            <ShieldCheckIcon className="h-4 w-4" />
            Why Choose BiometricBallot
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Next-Generation Voting Technology
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our platform combines cutting-edge security with user-friendly design to deliver 
            the most secure and transparent voting experience possible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2 bg-white"
            >
              <CardContent className="p-8">
                <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-vote-blue transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                <div className={`h-1 w-0 group-hover:w-full bg-gradient-to-r ${feature.color} mt-6 transition-all duration-500 rounded-full`}></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { number: "99.9%", label: "Security Rating" },
            { number: "< 2s", label: "Vote Processing" },
            { number: "24/7", label: "Platform Uptime" },
            { number: "256-bit", label: "Encryption Level" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-vote-blue mb-2">{stat.number}</div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
