"use client"; // Needs to be client component for auth check/redirect

import * as React from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  // Check auth status on client-side to potentially redirect
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
      if (!isLoading && user) {
          // If logged in, redirect to dashboard immediately
          router.replace('/dashboard');
      }
  }, [user, isLoading, router]);

  // Show loading indicator while checking auth status or if user is logged in (during redirect)
  if (isLoading || user) {
      return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  // Render landing page content only if not loading and not logged in
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Welcome to Knot Dashboard
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Your all-in-one solution for managing tasks, interacting with a web terminal, and keeping your profile up-to-date. Access your workspace from anywhere.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/login" passHref>
             <Button size="lg">Log in</Button>
          </Link>
          <Link href="/signup" passHref>
            <Button variant="outline" size="lg">
                Sign up <span aria-hidden="true">&rarr;</span>
             </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
