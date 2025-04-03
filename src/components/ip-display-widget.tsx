"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { LoginHistoryEntry } from '@/context/AuthContext'; // Import the type

interface IpDisplayWidgetProps {
  loginHistory?: LoginHistoryEntry[] | null; // Accept the history array
  isLoading: boolean; // Receive loading state from parent
}

export function IpDisplayWidget({ loginHistory, isLoading }: IpDisplayWidgetProps) {
  const renderContent = () => {
    if (isLoading) {
      return <Skeleton className="h-5 w-3/4" />;
    }
    // Get the most recent entry (first in the array)
    const latestEntry = loginHistory?.[0];
    if (latestEntry?.ipAddress) {
      return <p className="text-sm font-medium">{latestEntry.ipAddress}</p>;
    }
    return <p className="text-sm text-muted-foreground">IP not available.</p>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Last Login IP</CardTitle>
        <CardDescription>The IP address recorded during your last login.</CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
