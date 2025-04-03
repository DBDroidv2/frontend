"use client"; // Make it a client component to use hooks

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { TerminalSquare, User } from 'lucide-react'; // Import icons
import { WeatherWidget } from '@/components/weather-widget'; // Import WeatherWidget
import { IpDisplayWidget } from '@/components/ip-display-widget'; // Import IP Widget
import React from 'react'; // Import React for useEffect
import { motion } from 'framer-motion'; // Import motion
import Image from 'next/image'; // Import Next Image

export default function DashboardPage() {
  const { user, isLoggingIn } = useAuth(); // Get user info and the new isLoggingIn state

  // Add logging to see state changes
  React.useEffect(() => {
    console.log("[DashboardPage] Render - isLoggingIn:", isLoggingIn, "User:", user);
  }, [user, isLoggingIn]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Stagger animation of children
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible" // Animate when component mounts
    >
      {/* Welcome Widget */}
      <motion.div variants={itemVariants} className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Welcome back{user?.displayName ? `, ${user.displayName}` : (user?.email ? `, ${user.email.split('@')[0]}` : '')}!</CardTitle>
          <CardDescription>Here's a quick overview of your Knot dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>You can manage your profile, access the terminal, and view settings.</p>
          {/* Add more introductory text or links if needed */}
        </CardContent> {/* Added missing closing tag */}
        </Card>
      </motion.div>

      {/* Quick Actions Widget */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Jump right into common tasks.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/terminal">
              <TerminalSquare className="mr-2 h-4 w-4" /> Go to Terminal
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/profile">
              <User className="mr-2 h-4 w-4" /> View Profile
            </Link>
          </Button>
          {/* Add more actions later, e.g., Settings */}
          </CardContent>
        </Card>
      </motion.div>

      {/* Placeholder Stats Widget */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Stats</CardTitle>
          <CardDescription>Usage statistics (coming soon).</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Detailed usage information will be displayed here.</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weather Widget */}
      <motion.div variants={itemVariants}>
        <WeatherWidget />
      </motion.div>

      {/* IP Display Widget */}
      <motion.div variants={itemVariants}>
      <IpDisplayWidget loginHistory={user?.loginHistory} isLoading={isLoggingIn} />
      </motion.div>

      {/* Example Image Card Widget */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Example Image</CardTitle>
            <CardDescription>Animated card with an image.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
             <Image
                src="/next.svg" // Path relative to /public
                alt="Next.js Logo"
                width={100}
                height={100}
                className="dark:invert" // Invert colors in dark mode for visibility
             />
          </CardContent>
        </Card>
      </motion.div>

      {/* Add more widgets here as needed */}

    </motion.div>
  );
}
