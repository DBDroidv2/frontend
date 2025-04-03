import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to get public IP
export async function getPublicIp(): Promise<string | null> {
  try {
    // Use a reliable service like ipify
    const response = await fetch('https://api.ipify.org?format=json');
    if (!response.ok) throw new Error(`Failed to fetch IP: ${response.statusText}`);
    const data = await response.json();
    if (data && data.ip) {
      return data.ip;
    }
    throw new Error('Invalid response format from IP service');
  } catch (error) {
    console.error("Error fetching public IP:", error);
    return null; // Return null on error
  }
}
