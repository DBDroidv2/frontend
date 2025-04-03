"use client";

import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import { useAuth, type LoginHistoryEntry } from '@/context/AuthContext'; // Import useAuth hook AND LoginHistoryEntry type
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// Define the profile update form schema
const profileFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  displayName: z.string().max(50, { message: "Display name cannot exceed 50 characters." }).optional().nullable(), // Add displayName
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Define the expected shape of user data from GET /me (matching BackendUserProfile in context)
interface UserProfile {
    _id: string; // Use _id as returned by backend
    email: string;
    createdAt: string;
    loginHistory?: LoginHistoryEntry[]; // Use the imported type
    displayName?: string | null; // Add displayName
    // Add displayName, etc. if applicable
}

export default function ProfilePage() {
  const { token, user, login } = useAuth(); // Get token, current user, and login function (to update context)
  const [isLoading, setIsLoading] = useState(false); // Loading state for form submission
  const [isFetching, setIsFetching] = useState(true); // Loading state for initial data fetch
  const [error, setError] = useState<string | null>(null); // Error state for form submission
  const [fetchError, setFetchError] = useState<string | null>(null); // Error state for initial data fetch
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<UserProfile | null>(null); // State to hold fetched profile

  // Initialize the form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      email: "", // Will be populated by fetch
      displayName: "", // Add default
    },
  });

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
          setFetchError("Not authenticated.");
          setIsFetching(false);
          return;
      }
      setFetchError(null);
      setIsFetching(true);
      try {
        const response = await fetch('http://localhost:5000/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data: UserProfile = await response.json();

        if (!response.ok) {
          throw new Error((data as any).message || `HTTP error! status: ${response.status}`);
        }

        // Populate form and state with fetched data
        setProfileData(data); // Store full profile data
        form.reset({ email: data.email, displayName: data.displayName || "" }); // Reset form with fetched data

      } catch (err: any) {
        console.error("Fetch profile error:", err);
        setFetchError(err.message || "Failed to fetch profile data.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, [token, form]); // Dependency on token and form (form.reset is stable)


  // Handle form submission for profile update
  const onSubmit = async (values: ProfileFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!token) {
        setError("Not authenticated.");
        setIsLoading(false);
        return;
    }

    console.log("Updating profile with:", values);

    try {
      const response = await fetch('http://localhost:5000/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(values), // Send only fields defined in the form schema
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      console.log('Profile update successful:', data);
      setSuccessMessage("Profile updated successfully!");

      // Refresh the user state in AuthContext to reflect changes
      // Pass null for token to indicate we're just refreshing user data
      // Pass the updated data from the PUT response (or an empty object if needed)
      // The login function will now refetch /me using the existing token
      await login(null, data); // Re-fetch and update user context



    } catch (err: any) {
      console.error("Update profile error:", err);
      setError(err.message || "An unexpected error occurred during update.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Adjust container max-width and add gap between cards
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>
            Manage your account details.
            {isFetching && <span className="ml-2 text-muted-foreground">Loading profile...</span>}
            {fetchError && <p className="mt-2 text-sm font-medium text-destructive">Error loading profile: {fetchError}</p>}
          </CardDescription>
        </CardHeader>
        {!isFetching && !fetchError && (
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
                            placeholder="your@email.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isLoading || isFetching}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your Name"
                            disabled={isLoading || isFetching}
                            {...field}
                            // Ensure value is handled correctly for null/undefined
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Display other profile info */}
                  <div className="space-y-1">
                    <FormLabel>Account Created</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  {/* Removed the single "Last Login" display */}

                   {error && (
                     <p className="text-sm font-medium text-destructive">{error}</p>
                   )}
                    {successMessage && (
                        <p className="text-sm font-medium text-green-600">{successMessage}</p>
                    )}
                </CardContent>
                <CardFooter className="mt-4"> {/* Add top margin */}
                  <Button type="submit" disabled={isLoading || isFetching}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
        )}
      </Card>

      {/* Login History Section */}
      <Card>
        <CardHeader>
          <CardTitle>Login History</CardTitle>
          <CardDescription>
            Recent login attempts for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFetching ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : fetchError ? (
             <p className="text-sm font-medium text-destructive">Error loading history: {fetchError}</p>
          ) : profileData?.loginHistory && profileData.loginHistory.length > 0 ? (
            <ul className="space-y-3">
              {profileData.loginHistory.map((entry: LoginHistoryEntry) => ( // Add type annotation
                <li key={entry._id || entry.timestamp} className="text-sm text-muted-foreground border-b pb-2 last:border-b-0">
                  <span className="font-medium text-foreground">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                  <br />
                  IP: {entry.ipAddress || 'N/A'}
                  {entry.city && `, Location: ${entry.city}${entry.region ? `, ${entry.region}` : ''}${entry.country ? `, ${entry.country}` : ''}`}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No login history available.</p>
          )}
        </CardContent>
      </Card>
    </div> // Close the container div
  );
}
