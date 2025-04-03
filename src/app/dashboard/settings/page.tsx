"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext"; // To ensure user is logged in

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
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
// TODO: Add toast notifications for success/error messages
// import { useToast } from "@/components/ui/use-toast";

// Define the form schema
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters." }),
  confirmPassword: z.string().min(1, { message: "Please confirm your new password." }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"], // Error applies to the confirm field
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function SettingsPage() {
  const { token } = useAuth(); // Get token for API calls
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  // const { toast } = useToast(); // Initialize toast

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: PasswordFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Basic check if token exists
    if (!token) {
        setError("Authentication error. Please log in again.");
        setIsLoading(false);
        return;
    }

    try {
      // API call to backend
      const response = await fetch('http://localhost:5000/api/users/change-password', { // Point to backend server
        method: 'PUT', // Use PUT or PATCH for updates
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Send auth token
        },
        body: JSON.stringify({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
        }), // Only send necessary fields
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      setSuccess("Password changed successfully!");
      // toast({ title: "Success", description: "Password changed successfully!" });
      form.reset(); // Clear form on success

    } catch (err: any) {
      console.error("Change password error:", err);
      setError(err.message || "An unexpected error occurred.");
      // toast({ variant: "destructive", title: "Error", description: err.message || "Failed to change password." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Adjust container max-width
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your account password here. Remember to choose a strong password.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem> {/* Removed grid class */}
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem> {/* Removed grid class */}
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem> {/* Removed grid class */}
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              {success && <p className="text-sm font-medium text-green-600">{success}</p>}
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      {/* Add other settings sections here later */}
    </div> // Close the container div
  );
}
