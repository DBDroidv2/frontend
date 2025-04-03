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

export default function DashboardPage() {
  const { user, isLoggingIn } = useAuth(); // Get user info and the new isLoggingIn state

  // Add logging to see state changes
  React.useEffect(() => {
    console.log("[DashboardPage] Render - isLoggingIn:", isLoggingIn, "User:", user);
  }, [user, isLoggingIn]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Welcome Widget */}
      <Card className="lg:col-span-2"> {/* Span 2 columns on larger screens */}
        <CardHeader>
          <CardTitle>Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!</CardTitle>
          <CardDescription>Here's a quick overview of your Knot dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>You can manage your profile, access the terminal, and view settings.</p>
          {/* Add more introductory text or links if needed */}
        </CardContent>
      </Card>

      {/* Quick Actions Widget */}
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

      {/* Placeholder Stats Widget */}
      <Card>
        <CardHeader>
          <CardTitle>Stats</CardTitle>
          <CardDescription>Usage statistics (coming soon).</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Detailed usage information will be displayed here.</p>
        </CardContent>
      </Card>

      {/* Weather Widget */}
      {/* Weather Widget */}
      {/* Weather Widget */}
      {/* Weather Widget */}
      <WeatherWidget />

      {/* IP Display Widget */}
      <IpDisplayWidget loginHistory={user?.loginHistory} isLoading={isLoggingIn} />

      {/* Add more widgets here as needed */}

    </div>
  );
}
