import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Ensure Tailwind/Shadcn base styles are loaded
import { cn } from "@/lib/utils"; // Utility for conditional classes from Shadcn
import { AuthProvider } from "@/context/AuthContext"; // Import the AuthProvider

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Knot Dashboard",
  description: "Dashboard with in-browser terminal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Ensure no whitespace or comments between <html> and <body> */}
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <AuthProvider>
          {/* ThemeProvider or other global providers can go here */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
