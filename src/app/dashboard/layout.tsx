"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Home,
  TerminalSquare,
  User,
  Settings,
  LogOut,
  PanelLeft,
  UserCircle, // Fallback icon
  Info, // Import Info icon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
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
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/terminal', label: 'Terminal', icon: TerminalSquare },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    { href: '/about', label: 'About', icon: Info }, // Updated About link path
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    return href !== '/dashboard' && pathname.startsWith(href);
  }

  const SidebarNav = ({ isMobile = false }: { isMobile?: boolean }) => (
     <nav className={cn(
        "grid gap-1 p-2",
        isMobile ? "" : "items-start" // Removed mt-auto for mobile to keep items at top
      )}>
        {navItems.map((item) => (
            <TooltipProvider key={item.href} delayDuration={0}>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href={item.href}>
                             <Button
                                variant={isActive(item.href) ? 'secondary' : 'ghost'}
                                size={isMobile ? "default" : "icon"} // Use default size on mobile
                                className={cn("rounded-lg w-full", isMobile ? "justify-start" : "")}
                                aria-label={item.label}
                             >
                                <item.icon className={cn("size-5", isMobile ? "mr-4" : "")} />
                                {isMobile && <span>{item.label}</span>}
                                {!isMobile && <span className="sr-only">{item.label}</span>}
                            </Button>
                         </Link>
                    </TooltipTrigger>
                    {!isMobile && (
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
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
         <SidebarNav />
         <nav className="mt-auto grid gap-1 p-2">
             {/* Desktop Logout Button */}
             <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                       <Button variant="ghost" size="icon" className="mt-auto rounded-lg" aria-label="Logout" onClick={logout}>
                             <LogOut className="size-5" />
                             <span className="sr-only">Logout</span>
                       </Button>
                    </TooltipTrigger>
                     <TooltipContent side="right" sideOffset={5}>
                       Logout
                    </TooltipContent>
                </Tooltip>
             </TooltipProvider>
         </nav>
      </aside>

      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14"> {/* Adjust padding-left for desktop sidebar */}
        {/* Header Area */}
        {/* Adjusted header: justify-between always, added search */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
           {/* Mobile Menu Trigger (Left) */}
           <Sheet>
             <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
             </SheetTrigger>
             <SheetContent side="left" className="sm:max-w-xs flex flex-col">
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
                  <DropdownMenuSeparator />
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
