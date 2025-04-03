"use client";

import * as React from "react"; // Import React for potential state later if needed
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu } from "lucide-react"; // Import Menu icon
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"; // Import Sheet components
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'; // Import VisuallyHidden
import { useAuth } from '@/context/AuthContext'; // Import useAuth

export function LandingHeader() {
  const { user } = useAuth(); // Get user status

  // Links data for reusability - excluding auth links now
  const navLinks = [
    { href: "/about", label: "About", variant: "ghost" as const },
    { href: "/contact", label: "Contact", variant: "ghost" as const },
    { href: "/roadmap", label: "Roadmap", variant: "ghost" as const }, // Added Roadmap
  ];

  return (
    <motion.header
      className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 md:p-6"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
    >
      {/* Logo/Brand */}
       <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          {/* Placeholder Logo */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-7c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z"/></svg>
        <span className="hidden md:inline">Knot Dashboard</span> {/* Hide text on small screens */}
       </Link>

       {/* Desktop Navigation */}
      <nav className="hidden items-center gap-x-2 md:flex md:gap-x-4">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} passHref>
            <Button variant={link.variant} size="sm">{link.label}</Button>
          </Link>
        ))}
        {/* Conditional Auth Buttons - Desktop */}
        {user ? (
          <Link href="/dashboard" passHref>
            <Button variant="default" size="sm">Go to Dashboard</Button>
          </Link>
        ) : (
          <>
            <Link href="/login" passHref>
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/signup" passHref>
              <Button variant="default" size="sm">Sign up</Button>
            </Link>
          </>
        )}
        <ThemeToggle />
      </nav>

      {/* Mobile Navigation Trigger */}
      <div className="flex items-center gap-x-2 md:hidden">
        <ThemeToggle />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
             <VisuallyHidden>
               <SheetTitle>Mobile Navigation Menu</SheetTitle>
             </VisuallyHidden>
            {/* Mobile Navigation Links */}
            <nav className="mt-8 grid gap-4">
              {/* Common Links */}
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} passHref>
                  <Button variant={link.variant} size="lg" className="w-full justify-start">
                    {link.label}
                  </Button>
                </Link>
              ))}
              {/* Conditional Auth Buttons - Mobile */}
              {user ? (
                <Link href="/dashboard" passHref>
                  <Button variant="default" size="lg" className="w-full justify-start">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" passHref>
                    <Button variant="ghost" size="lg" className="w-full justify-start">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup" passHref>
                    <Button variant="default" size="lg" className="w-full justify-start">
                      Sign up
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  );
}
