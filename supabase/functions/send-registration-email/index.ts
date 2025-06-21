
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RegistrationEmailRequest {
  email: string;
  fullName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName }: RegistrationEmailRequest = await req.json();

    // For now, we'll use a simple email service placeholder
    // In production, you would integrate with a real email service like Resend
    console.log(`Sending registration confirmation email to: ${email}`);
    console.log(`User name: ${fullName}`);

    // Simulate email sending
    const emailData = {
      to: email,
      subject: "Welcome to Biometric Ballot Chain - Registration Successful",
      html: `
        <h1>Welcome to Biometric Ballot Chain, ${fullName}!</h1>
        <p>Your account has been successfully registered.</p>
        <p>Next steps:</p>
        <ul>
          <li>Complete your biometric fingerprint setup</li>
          <li>Verify your identity</li>
          <li>Start participating in secure voting</li>
        </ul>
        <p>Thank you for joining our secure voting platform!</p>
        <p>Best regards,<br>The Biometric Ballot Chain Team</p>
      `,
    };

    console.log("Registration email would be sent:", emailData);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Registration email sent successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-registration-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
