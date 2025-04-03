"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from 'next/navigation'; // Import useRouter
import { useAuth } from "@/context/AuthContext"; // Import useAuth

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
  const { login } = useAuth(); // Use login from context for potential auto-login after signup
  const router = useRouter(); // Get router instance

  // Initialize the form
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    setError(null);
    const { email, password } = values;
    console.log("[Signup] Attempting signup for:", email); // Log attempt

    try {
      console.log("[Signup] Sending fetch request to http://localhost:5000/auth/signup with body:", JSON.stringify({ email, password }));
      // API call to backend
      const response = await fetch('http://localhost:5000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // Handle successful signup - Option 1: Auto-login and redirect to dashboard
      if (data.token && data.user) {
        login(data.token, data.user); // Use context's login function
        router.push('/dashboard'); // Redirect to dashboard
      } else {
         // This case should ideally not happen if backend sends token/user on 201
         throw new Error('Signup successful, but token or user data missing in response.');
      }

    } catch (err: any) {
      // Log the specific error type and message
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
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
    </div>
  );
}
