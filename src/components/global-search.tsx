"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function GlobalSearch() {
  // TODO: Implement search functionality (filtering, API calls, etc.)
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Search term:", event.target.value); // Placeholder action
  };

  return (
    <div className="relative ml-auto flex-1 md:grow-0">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search..."
        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
        onChange={handleSearch}
        // Add value and other props as needed for controlled component
      />
    </div>
  );
}
