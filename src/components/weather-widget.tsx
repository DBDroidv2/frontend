"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton'; // Use alias now that it's created
import Image from 'next/image'; // For displaying weather icon

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!token) {
        // Don't fetch if not authenticated (though backend route is protected anyway)
        setIsLoading(false);
        // setError("Not authenticated"); // Optional: show auth error
        return;
      }

      setIsLoading(true);
      setError(null);

      // 1. Get Public IP from frontend
      const publicIp = await getPublicIp();

      if (!publicIp) {
        setError("Could not determine public IP address.");
        setIsLoading(false);
        return;
      }

      // 2. Construct backend URL with the fetched public IP
      const apiUrl = `http://localhost:5000/api/weather?ip=${encodeURIComponent(publicIp)}`;

      try {
        console.log(`[Weather Widget] Fetching weather using public IP from: ${apiUrl}`);
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        setWeather(data);

      } catch (err: any) {
        console.error("Failed to fetch weather:", err);
        setError(err.message || "Could not load weather data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
  }, [token]); // Only re-fetch if token changes

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
        <CardTitle>Weather</CardTitle>
        {/* Description can now just show the fetched city */}
        <CardDescription>
          {isLoading ? 'Loading location...' : (weather ? `Current conditions for ${weather.city}` : 'Location unavailable')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
