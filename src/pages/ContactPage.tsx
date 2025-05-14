
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MailIcon, PhoneIcon, MapPinIcon } from "lucide-react";

const ContactPage = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic (e.g., send email, save to DB)
    alert("Message sent (dummy action)!");
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-12">
        <h1 className="text-4xl font-bold text-vote-blue mb-8 text-center">Contact Us</h1>
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white p-8 rounded-lg shadow-lg border border-vote-light">
            <h2 className="text-2xl font-semibold text-vote-blue mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" type="text" placeholder="Your Name" required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="your@email.com" required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" type="text" placeholder="Inquiry Subject" required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Your message..." required rows={5} className="mt-1" />
              </div>
              <Button type="submit" className="w-full bg-vote-teal hover:bg-vote-blue">
                Send Message
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-vote-blue mb-6">Get in Touch</h2>
            <div className="flex items-start space-x-4">
              <MailIcon className="h-8 w-8 text-vote-teal mt-1" />
              <div>
                <h3 className="text-lg font-medium text-vote-blue">Email</h3>
                <p className="text-gray-600">support@biometricballot.example.com</p>
                <p className="text-gray-600">info@biometricballot.example.com</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <PhoneIcon className="h-8 w-8 text-vote-teal mt-1" />
              <div>
                <h3 className="text-lg font-medium text-vote-blue">Phone</h3>
                <p className="text-gray-600">+1 (555) 123-4567 (Support)</p>
                <p className="text-gray-600">+1 (555) 987-6543 (General)</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <MapPinIcon className="h-8 w-8 text-vote-teal mt-1" />
              <div>
                <h3 className="text-lg font-medium text-vote-blue">Office Address</h3>
                <p className="text-gray-600">123 Voting Lane, Secure City, ST 98765</p>
                <p className="text-gray-600">United States of America</p>
              </div>
            </div>
             <p className="text-sm text-gray-500">
              Please note: These are dummy contact details for demonstration purposes.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ContactPage;
