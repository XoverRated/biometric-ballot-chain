
import { MainLayout } from "@/components/layout/MainLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does facial recognition authentication enhance security?",
    answer: "Facial recognition authentication uses unique facial characteristics to verify your identity, making it significantly harder for unauthorized individuals to access your account or cast a vote on your behalf."
  },
  {
    question: "Is my voting data anonymous?",
    answer: "Yes, while your identity is verified for eligibility, your actual vote is decoupled from your personal information to ensure anonymity and privacy. The system is designed to protect voter confidentiality."
  },
  {
    question: "What happens if the facial recognition scan fails?",
    answer: "If a facial recognition scan fails multiple times, there may be alternative verification methods available, or you might need to contact support for assistance. Ensure you are in good lighting and looking directly at the camera."
  },
  {
    question: "Can I change my vote after submitting it?",
    answer: "Typically, once a vote is cast and confirmed, it cannot be changed to maintain the integrity of the election process. Please review your selections carefully before submitting."
  },
  {
    question: "How is the election data stored and protected?",
    answer: "Election data is stored using secure, decentralized blockchain technologies with strong encryption. This protects against tampering and ensures transparency, as verifiable records are maintained."
  }
];

const FAQPage = () => {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-12">
        <h1 className="text-4xl font-bold text-vote-blue mb-8 text-center">Frequently Asked Questions</h1>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-lg font-semibold hover:text-vote-teal">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-gray-700">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </MainLayout>
  );
};

export default FAQPage;
