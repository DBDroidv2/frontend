"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import { motion } from 'framer-motion'; // Import motion
import { LandingParticles } from '@/components/landing-particles'; // Import particles

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define the form schema using Zod
const signupFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

export default function SignupPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    setError(null);
    const { email, password } = values;
    console.log("[Signup] Attempting signup for:", email);

    try {
      console.log("[Signup] Sending fetch request to http://localhost:5000/auth/signup with body:", JSON.stringify({ email, password }));
      const response = await fetch('http://localhost:5000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.token && data.user) {
        login(data.token, data.user);
        router.push('/dashboard');
      } else {
        throw new Error('Signup successful, but token or user data missing in response.');
      }
    } catch (err: any) {
      console.error("[Signup] Fetch or processing error occurred:", err);
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        console.error("[Signup] This looks like a network error. Is the backend server running and accessible at http://localhost:5000? Check for CORS issues if the backend received the request but the browser blocked the response.");
        setError("Network error: Could not connect to the server. Please ensure it's running.");
      } else {
        setError(err.message || "An unexpected error occurred during signup.");
      }
    } finally {
      console.log("[Signup] Finished signup attempt for:", email);
      setIsLoading(false);
    }
  };

  // Animation variants - Simplified to opacity only
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    // Add 'relative' back to establish stacking context
    <div className="relative grid min-h-screen w-full md:grid-cols-2">
      <LandingParticles /> {/* Add particles */}
       {/* Column 1: Signup Form - Add motion and z-index */}
       <motion.div
         className="z-10 flex items-center justify-center bg-background p-6 md:p-10" // Added z-10
         variants={containerVariants}
         initial="hidden"
        animate="visible"
      >
        <Card className="w-full max-w-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>
              Enter your email and password below to create your account
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="m@example.com"
                          type="email"
                          autoCapitalize="none"
                          autoComplete="email"
                          autoCorrect="off"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error && (
                  <p className="text-sm font-medium text-destructive">{error}</p>
                )}
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
                <div className="mt-4 text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/login" className="underline">
                    Login
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </motion.div> {/* Close motion div for Column 1 */}

      {/* Column 2: Branding/Image (Hidden on small screens) - Add motion and z-index */}
      <motion.div
        className="z-10 hidden items-center justify-center bg-muted p-10 md:flex" // Added z-10
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="mx-auto grid w-[350px] gap-6 text-center">
          {/* Re-use logo */}
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-16 w-16 text-primary"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-7c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z"/></svg>
          <h1 className="text-3xl font-bold text-primary">Knot Dashboard</h1>
          <p className="text-balance text-muted-foreground">
            Join us and streamline your workflow today.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
