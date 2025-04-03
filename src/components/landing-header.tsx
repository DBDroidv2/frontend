"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle"; // Import ThemeToggle

export function LandingHeader() {
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
        <span>Knot Dashboard</span>
      </Link>

      {/* Navigation Links/Actions */}
      <nav className="flex items-center gap-x-2 md:gap-x-4"> {/* Adjusted gap */}
         <Link href="/about" passHref>
           <Button variant="ghost" size="sm">About</Button>
         </Link>
        <Link href="/login" passHref>
          <Button variant="ghost" size="sm">Log in</Button>
        </Link>
        <Link href="/signup" passHref>
          <Button variant="default" size="sm">Sign up</Button>
        </Link>
        <ThemeToggle /> {/* Add ThemeToggle */}
      </nav>
    </motion.header>
  );
}
