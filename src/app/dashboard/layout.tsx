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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Get current path for active link styling

  useEffect(() => {
    // Redirect unauthenticated users to login page
    if (!isLoading && !token) {
      console.log("Dashboard Layout: No token found, redirecting to login.");
      router.push('/login');
    }
  }, [isLoading, token, router]);

  // Render loading state or null if redirecting
  if (isLoading || !token) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/terminal', label: 'Terminal', icon: TerminalSquare }, // Added Terminal link
    { href: '/dashboard/profile', label: 'Profile', icon: User },
    // { href: '/dashboard/settings', label: 'Settings', icon: Settings }, // Settings page not implemented yet
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
        {/* Mobile Header & User Menu Area */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:justify-end">
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

           {/* User Menu (Right) */}
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
                  {/* Add Settings link here when implemented */}
                  {/* <Link href="/dashboard/settings" passHref><DropdownMenuItem>Settings</DropdownMenuItem></Link> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

        </header>

        {/* Main Content Area */}
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
