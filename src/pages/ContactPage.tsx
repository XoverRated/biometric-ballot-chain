import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MailIcon, PhoneIcon, MapPinIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ContactPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!name || !email || !subject || !message) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase
        .from("contact_messages")
        .insert([{ name, email, subject, message }]);

      if (error) {
        throw error;
      }

      toast({
        title: "Message Sent!",
        description: "Thanks for reaching out. We'll get back to you soon.",
      });
      // Reset form
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error: any) {
      console.error("Error sending contact message:", error);
      toast({
        title: "Error Sending Message",
        description: error.message || "Could not send your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
                <Input
                  id="name"
                  type="text"
                  placeholder="Your Name"
                  required
                  className="mt-1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  className="mt-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="Inquiry Subject"
                  required
                  className="mt-1"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Your message..."
                  required
                  rows={5}
                  className="mt-1"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-vote-teal hover:bg-vote-blue"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
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
                <p className="text-gray-600">biometricballot.fyp100@gmail.com</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <PhoneIcon className="h-8 w-8 text-vote-teal mt-1" />
              <div>
                <h3 className="text-lg font-medium text-vote-blue">Phone</h3>
                <p className="text-gray-600">+255 623 623 349</p>
                <p className="text-gray-600">+255 74 428 9097</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <MapPinIcon className="h-8 w-8 text-vote-teal mt-1" />
              <div>
                <h3 className="text-lg font-medium text-vote-blue">Office Address</h3>
                <p className="text-gray-600">Golani-Ubungo Msewe</p>
              </div>
            </div>
             <p className="text-sm text-gray-500">
              These contact details are for the project.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ContactPage;
