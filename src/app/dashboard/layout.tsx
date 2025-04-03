"use client";

import React, { useEffect, useState } from 'react'; // Import useState
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard, // Changed from Home
  TerminalSquare,
  User,
  Home, // Added for Home link
  Settings,
  LogOut,
  PanelLeft,
  UserCircle, // Fallback icon
  Info, // Import Info icon
  Mail, // Import Mail icon for Contact
  Map, // Import Map icon for Roadmap
  ChevronsLeft, // Icon for collapse
  ChevronsRight, // Icon for expand
  Bot, // Added Bot icon for AI Chat
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle, // Import SheetTitle
  SheetTrigger,
} from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'; // Import VisuallyHidden
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle'; // Import ThemeToggle
import { Skeleton } from "../../components/ui/skeleton"; // Use relative path
import { GlobalSearch } from '@/components/global-search'; // Import GlobalSearch
import { Notifications } from '@/components/notifications'; // Import Notifications
import { motion } from 'framer-motion'; // Import motion

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Add isLoggingOut to the destructured context values
  const { user, token, isLoading, isLoggingOut, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Get current path for active link styling
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false); // State for sidebar

  useEffect(() => {
    // Redirect unauthenticated users to login page *only if* not loading, no token, AND not currently logging out
    if (!isLoading && !token && !isLoggingOut) {
      console.log("Dashboard Layout: Auth check complete, no token, not logging out -> redirecting to login.");
      router.push('/login');
    }
  }, [isLoading, token, router]);

  // Render loading state or null if redirecting
  if (isLoading || !token) {
    // Skeleton loader matching the layout structure
    return (
      <div className="flex min-h-screen w-full flex-col">
        {/* Skeleton Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
          <div className="flex flex-col items-center gap-4 px-2 py-5">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
          <div className="mt-auto flex flex-col items-center gap-4 px-2 py-5">
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </aside>
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          {/* Skeleton Header */}
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 sm:justify-end sm:border-0 sm:bg-transparent sm:px-6">
            {/* Mobile Skeleton Trigger */}
            <Skeleton className="h-8 w-8 sm:hidden" />
            {/* Right side Skeleton */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8" /> {/* Theme Toggle Skeleton */}
              <Skeleton className="h-8 w-8 rounded-full" /> {/* User Menu Skeleton */}
            </div>
          </header>
          {/* Skeleton Main Content */}
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Skeleton className="h-32 w-full rounded-lg" /> {/* Example content skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/', label: 'Home', icon: Home }, // Added Home link
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }, // Changed icon
    { href: '/dashboard/terminal', label: 'Terminal', icon: TerminalSquare },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    { href: '/dashboard/ai-chat', label: 'AI Chat', icon: Bot }, // Added AI Chat link
    { href: '/about', label: 'About', icon: Info }, // Updated About link path
    { href: '/contact', label: 'Contact', icon: Mail }, // Added Contact link
    { href: '/roadmap', label: 'Roadmap', icon: Map }, // Added Roadmap link
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') return true;
     // Adjust isActive logic slightly for root path '/'
     if (href === '/') return pathname === '/';
     if (href === '/dashboard' && pathname === '/dashboard') return true;
     return href !== '/dashboard' && pathname.startsWith(href);
  }

  // Update SidebarNav to accept isExpanded prop
  const SidebarNav = ({ isMobile = false, isExpanded = false }: { isMobile?: boolean, isExpanded?: boolean }) => (
     <nav className={cn(
        "grid gap-1 p-2",
        isMobile ? "" : "items-start"
      )}>
        {navItems.map((item) => (
            <TooltipProvider key={item.href} delayDuration={0}>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href={item.href}>
                             <Button
                                variant={isActive(item.href) ? 'secondary' : 'ghost'}
                                // Adjust size and class based on mobile/expanded state
                                size={isMobile ? "default" : isExpanded ? "default" : "icon"}
                                className={cn(
                                  "rounded-lg w-full transition-all duration-300 ease-in-out",
                                  (isMobile || isExpanded) ? "justify-start" : "justify-center" // Center icon when collapsed
                                )}
                                aria-label={item.label}
                             >
                                <item.icon className={cn("size-5", (isMobile || isExpanded) ? "mr-4" : "mr-0")} />
                                {(isMobile || isExpanded) && <span>{item.label}</span>}
                                {!isMobile && !isExpanded && <span className="sr-only">{item.label}</span>}
                            </Button>
                         </Link>
                    </TooltipTrigger>
                    {/* Only show tooltip when sidebar is collapsed on desktop */}
                    {!isMobile && !isExpanded && (
                        <TooltipContent side="right" sideOffset={5}>
                           {item.label}
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
        ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {/* Desktop Sidebar - Apply conditional width and transition */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-10 hidden flex-col border-r bg-background sm:flex transition-all duration-300 ease-in-out",
        isSidebarExpanded ? "w-56" : "w-14" // Conditional width
      )}
      // Add hover events to control expansion
      onMouseEnter={() => setIsSidebarExpanded(true)}
      onMouseLeave={() => setIsSidebarExpanded(false)}
      >
         {/* Pass isExpanded state */}
         <SidebarNav isExpanded={isSidebarExpanded} />
         <nav className="mt-auto grid gap-1 p-2">
             {/* Removed Sidebar Toggle Button */}
             {/* Desktop Logout Button */}
             <TooltipProvider delayDuration={0}>
                <Tooltip>
                     <TooltipTrigger asChild>
                         {/* Adjust logout button based on expanded state */}
                         <Button
                             variant="ghost"
                             size={isSidebarExpanded ? "default" : "icon"}
                             className={cn("rounded-lg w-full", isSidebarExpanded ? "justify-start" : "")}
                             aria-label="Logout"
                             onClick={logout}
                         >
                             <LogOut className={cn("size-5", isSidebarExpanded ? "mr-4" : "")} />
                             {isSidebarExpanded && <span>Logout</span>}
                             {!isSidebarExpanded && <span className="sr-only">Logout</span>}
                         </Button>
                     </TooltipTrigger>
                     {/* Only show tooltip when collapsed */}
                     {!isSidebarExpanded && (
                         <TooltipContent side="right" sideOffset={5}>
                             Logout
                         </TooltipContent>
                     )}
                 </Tooltip>
             </TooltipProvider>
         </nav>
      </aside>

      {/* Main Content Area - Apply conditional padding-left and transition */}
      <div className={cn(
        "flex flex-col sm:gap-4 sm:py-4 transition-all duration-300 ease-in-out",
        isSidebarExpanded ? "sm:pl-56" : "sm:pl-14" // Conditional padding
      )}>
        {/* Header Area */}
        <header className={cn(
          "sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6",
          // Adjust header padding based on sidebar state? Optional.
          // isSidebarExpanded ? "sm:pl-56" : "sm:pl-14"
        )}>
           {/* Mobile Menu Trigger (Left) */}
           <Sheet>
             <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
             </SheetTrigger>
             <SheetContent side="left" className="sm:max-w-xs flex flex-col">
                {/* Add visually hidden title for accessibility */}
                <VisuallyHidden>
                  <SheetTitle>Mobile Navigation Menu</SheetTitle>
                </VisuallyHidden>
                <SidebarNav isMobile={true} />
                {/* Mobile Logout Button */}
                 <Button variant="ghost" className="mt-auto justify-start" aria-label="Logout" onClick={logout}>
                     <LogOut className="size-5 mr-4" />
                     Logout
                 </Button>
            </SheetContent>
           </Sheet>

           {/* Global Search (Takes up space in the middle on larger screens) */}
           <GlobalSearch />

           {/* Right side of Header: Notifications, Theme Toggle, and User Menu */}
           <div className="flex items-center gap-4 md:ml-auto"> {/* Added md:ml-auto to push right */}
             <Notifications /> {/* Add the notifications button */}
             <ThemeToggle /> {/* Add the theme toggle button */}

             {/* User Menu */}
             <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                    variant="outline"
                    size="icon"
                    className="overflow-hidden rounded-full"
                  >
                    <Avatar className="h-8 w-8"> {/* Adjusted size */}
                        {/* Add AvatarImage if user has profile picture URL */}
                        {/* <AvatarImage src={user?.imageUrl || undefined} alt="User Avatar" /> */}
                        <AvatarFallback>
                           {/* Show user's initials or fallback icon */}
                           {user?.email ? user.email.charAt(0).toUpperCase() : <UserCircle className="size-5" />}
                         </AvatarFallback>
                    </Avatar>
                     <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/dashboard/profile" passHref>
                     <DropdownMenuItem>Profile</DropdownMenuItem>
                  </Link>
                  <Link href="/dashboard/settings" passHref>
                     <DropdownMenuItem>Settings</DropdownMenuItem>
                  </Link>
                  <Link href="/about" passHref> {/* Updated About link path */}
                     <DropdownMenuItem>About</DropdownMenuItem>
                  </Link>
                  <Link href="/contact" passHref> {/* Added Contact link */}
                     <DropdownMenuItem>Contact</DropdownMenuItem>
                  </Link>
                  <Link href="/roadmap" passHref> {/* Added Roadmap link */}
                     <DropdownMenuItem>Roadmap</DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <Link href="/" passHref> {/* Added Home link */}
                     <DropdownMenuItem>Home</DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
           </div> {/* Close the wrapper div */}

        </header>

        {/* Main Content Area with Animation */}
        <motion.main
          key={pathname} // Animate when pathname changes
          className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8"
          initial={{ opacity: 0, y: 10 }} // Start slightly down
          animate={{ opacity: 1, y: 0 }} // Animate to final position
          exit={{ opacity: 0, y: -10 }} // Exit slightly up (requires AnimatePresence wrapper for exit)
          transition={{ duration: 0.4, ease: "easeInOut" }} // Slightly longer duration
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
