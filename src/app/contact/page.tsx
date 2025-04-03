"use client"; // Add this directive

import React from 'react';
import { LandingHeader } from '@/components/landing-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '../../components/ui/textarea'; // Use relative path
import { Button } from '@/components/ui/button';
import { Mail, MapPin } from 'lucide-react'; // Import icons

export default function ContactPage() {
  // Basic form handler placeholder (does nothing yet)
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Form submitted (placeholder)");
    // Add actual form submission logic here (e.g., API call)
  };

  return (
    <>
      <LandingHeader />
      {/* Adjust padding and alignment */}
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-6 md:p-12">
        {/* Use Card for consistent styling and glow */}
        <Card className="w-full max-w-4xl">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold tracking-tight sm:text-5xl">
              Contact Us
            </CardTitle>
            <CardDescription className="mt-4 text-lg leading-8">
              Have questions or feedback? We'd love to hear from you. Reach out using the methods below or send us a message.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Grid layout for contact info and form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-8">
              {/* Column 1: Contact Details */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold">Email</h3>
                    <a href="mailto:support@knot-dashboard.example.com" className="text-muted-foreground hover:text-foreground transition-colors">
                      support@knot-dashboard.example.com {/* Replace */}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold">Address</h3>
                    <p className="text-muted-foreground">
                      123 Dashboard Lane<br />Innovation City, ST 54321 {/* Replace */}
                    </p>
                  </div>
                </div>
                {/* Add Phone Number if applicable */}
                {/* <div className="flex items-start gap-4">
                  <Phone className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold">Phone</h3>
                    <p className="text-muted-foreground">(555) 123-4567</p>
                  </div>
                </div> */}
              </div>

              {/* Column 2: Contact Form */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Send a Message</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input type="text" placeholder="Your Name" required />
                  </div>
                  <div>
                    <Input type="email" placeholder="Your Email" required />
                  </div>
                  <div>
                    {/* Use Textarea component if available, otherwise standard textarea */}
                    <Textarea placeholder="Your Message" rows={5} required />
                  </div>
                  <div>
                    <Button type="submit" className="w-full md:w-auto">Send Message</Button>
                  </div>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
