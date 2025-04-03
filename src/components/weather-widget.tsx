"use client";

import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { // Import Tooltip components
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface WeatherData {
  city: string;
  temperature: number;
  description: string;
  icon: string;
  country: string;
}

// Helper function to get public IP
async function getPublicIp(): Promise<string | null> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    if (!response.ok) throw new Error('Failed to fetch IP');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Error fetching public IP:", error);
    return null;
  }
}

export function WeatherWidget() {
  const { token } = useAuth(); // Only need token now
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // State for refresh button
  const [error, setError] = useState<string | null>(null);

  // Fetch weather function, now accepts forceRefresh flag
  const fetchWeather = useCallback(async (forceRefresh = false) => {
      if (!token) {
        // Don't fetch if not authenticated
        setIsLoading(false); // Ensure initial loading stops
        setIsRefreshing(false); // Ensure refresh loading stops
        // setError("Not authenticated"); // Optional: show auth error
        return;
      }

      if (forceRefresh) {
          setIsRefreshing(true); // Indicate refresh in progress
      } else {
          setIsLoading(true); // Indicate initial load
      }
      setError(null); // Clear previous errors

      // 1. Get Public IP from frontend
      const publicIp = await getPublicIp();

      if (!publicIp) {
        setError("Could not determine public IP address.");
        setIsLoading(false);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      // 2. Construct backend URL, adding forceRefresh if needed
      let apiUrl = `http://localhost:5000/api/weather?ip=${encodeURIComponent(publicIp)}`;
      if (forceRefresh) {
          apiUrl += '&forceRefresh=true';
      }

      try {
        console.log(`[Weather Widget] Fetching weather from: ${apiUrl}`);
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        // Handle specific 429 Rate Limit error first
        if (response.status === 429) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'API rate limit exceeded.'); // Use message from backend
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        setWeather(data);

      } catch (err: any) {
        console.error("Failed to fetch weather:", err);
        setError(err.message || "Could not load weather data.");
        setWeather(null); // Clear potentially stale data on error
      } finally {
        setIsLoading(false); // Stop initial loading
        setIsRefreshing(false); // Stop refresh loading
      }
  }, [token]); // Dependency on token

  // Initial fetch on mount
  useEffect(() => {
    fetchWeather(); // Call without forceRefresh
  }, [fetchWeather]); // Depend on the memoized fetchWeather

  // Handler for the refresh button
  const handleRefresh = () => {
      fetchWeather(true); // Call with forceRefresh = true
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      );
    }

    if (error) {
      return <p className="text-sm text-destructive">Error: {error}</p>;
    }

    if (weather) {
      return (
        <div className="flex items-center gap-4">
          <Image
            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
            alt={weather.description}
            width={50}
            height={50}
          />
          <div>
            <p className="text-2xl font-bold">{Math.round(weather.temperature)}°C</p>
            <p className="text-sm capitalize">{weather.description}</p>
            <p className="text-xs text-muted-foreground">{weather.city}, {weather.country}</p>
          </div>
        </div>
      );
    }

    return <p className="text-sm text-muted-foreground">Weather data unavailable.</p>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Weather</CardTitle>
                <CardDescription>
                  {isLoading ? 'Loading location...' : (weather ? `Current conditions for ${weather.city}` : 'Location unavailable')}
                </CardDescription>
            </div>
            <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRefresh}
                            disabled={isLoading || isRefreshing}
                            className="h-8 w-8" // Smaller button
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span className="sr-only">Refresh Weather</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Refresh Weather</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
