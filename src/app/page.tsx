"use client"; // Needs to be client component for auth check/redirect

import * as React from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion'; // Import motion
import { TerminalSquare, User, Settings, CloudSun } from 'lucide-react'; // Import icons
import { LandingHeader } from '@/components/landing-header'; // Import LandingHeader
import { LandingParticles } from '@/components/landing-particles'; // Re-import LandingParticles

export default function LandingPage() {
  // Check auth status on client-side to potentially redirect
  // Get auth status but don't redirect automatically
  const { user, isLoading } = useAuth();
  // const router = useRouter(); // No longer needed for redirect

  // React.useEffect(() => {
  //     if (!isLoading && user) {
  //         // If logged in, redirect to dashboard immediately - REMOVED
  //         // router.replace('/dashboard');
  //     }
  // }, [user, isLoading, router]);

  // Show loading indicator only while checking auth status
  if (isLoading) {
      return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

  // Render landing page content only if not loading and not logged in
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center relative overflow-visible"> {/* Changed overflow-hidden to overflow-visible */}
       <LandingHeader /> {/* Add the header */}
       <LandingParticles /> {/* Add landing particles */}
      <motion.div
        className="max-w-2xl" // Removed z-10
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Placeholder Logo/Icon */}
        <motion.div variants={itemVariants} className="mb-8">
           {/* Replace with actual logo later */}
           <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-16 w-16 text-primary"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-7c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z"/></svg>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl font-bold tracking-tight sm:text-6xl"
        >
          Knot Dashboard
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="mt-6 text-lg leading-8 text-muted-foreground"
        >
          Knot Dashboard provides a seamless interface to manage your profile, access a powerful web terminal, and view relevant information like local weather, all in one place. Boost your productivity and stay organized.
        </motion.p>
        <motion.div
          variants={itemVariants}
          className="mt-10 flex items-center justify-center gap-x-6"
        >
          <Link href="/login" passHref>
             <Button size="lg">Log in</Button>
          </Link>
          <Link href="/signup" passHref>
            <Button variant="outline" size="lg">
                Sign up <span aria-hidden="true">&rarr;</span>
             </Button>
          </Link>
        </motion.div> {/* Close motion.div for buttons */}

      </motion.div> {/* Close main hero content container */}

       {/* Features Section */}
       <motion.div
          className="mt-20 max-w-4xl w-full px-4" // Removed z-10
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <h2 className="text-center text-2xl font-semibold leading-8 mb-10">
            Features Overview
          </h2>
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 text-center md:grid-cols-3">
            <motion.div variants={itemVariants}>
              <TerminalSquare className="mx-auto h-10 w-10 text-primary" />
              <h3 className="mt-6 font-semibold">Interactive Terminal</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Access a persistent PowerShell terminal directly in your browser.
              </p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <User className="mx-auto h-10 w-10 text-primary" />
              <h3 className="mt-6 font-semibold">Profile Management</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Easily update your email and display name to keep your account details current.
              </p>
            </motion.div>
             <motion.div variants={itemVariants}>
              <CloudSun className="mx-auto h-10 w-10 text-primary" />
              <h3 className="mt-6 font-semibold">IP-Based Weather</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                See current weather conditions based on your location.
              </p>
            </motion.div>
          </div>
        </motion.div>

       {/* How It Works Section */}
       <motion.div
          className="mt-20 max-w-4xl w-full px-4" // Consistent styling
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }} // Slightly delayed animation
        >
          <h2 className="text-center text-2xl font-semibold leading-8 mb-10">
            How It Works
          </h2>
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 text-center md:grid-cols-3">
            {/* Step 1: Sign Up/Log In */}
            <motion.div variants={itemVariants}>
              {/* Placeholder Icon - Consider LogIn or UserPlus */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-10 w-10 text-primary"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
              <h3 className="mt-6 font-semibold">1. Create Account or Log In</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Quickly sign up for a new account or log in if you already have one.
              </p>
            </motion.div>
            {/* Step 2: Access Dashboard */}
            <motion.div variants={itemVariants}>
               {/* Placeholder Icon - Consider LayoutDashboard */}
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-10 w-10 text-primary"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
              <h3 className="mt-6 font-semibold">2. Access Your Dashboard</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Once logged in, you'll land directly on your personal dashboard.
              </p>
            </motion.div>
            {/* Step 3: Utilize Features */}
            <motion.div variants={itemVariants}>
               {/* Placeholder Icon - Consider Terminal or Settings */}
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-10 w-10 text-primary"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
              <h3 className="mt-6 font-semibold">3. Utilize Features</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Use the interactive terminal, manage your profile, check the weather, and more.
              </p>
            </motion.div>
          </div>
        </motion.div>
    </main>
  );
}
