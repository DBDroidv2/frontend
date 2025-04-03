"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout'; // Import the hook
import { useRouter } from 'next/navigation'; // Import useRouter

// Define the shape of the user object (adjust as needed)
interface User {
  id: string; // Mongoose uses _id, but we map it to id
  email: string;
  createdAt?: string; // Optional, from backend
  loginHistory?: LoginHistoryEntry[]; // Added
  displayName?: string | null; // Added
  watchlist?: string[]; // Added watchlist
  // Removed lastLoginIp, lastLoginAt
}

// Define the structure for a single login history entry (Export it)
export interface LoginHistoryEntry {
  ipAddress?: string;
  timestamp: string; // Dates are usually strings in JSON
  city?: string;
  region?: string;
  country?: string;
  _id?: string; // Mongoose adds _id to subdocuments too
}


// Define an interface for the raw data coming from the backend /api/users/me endpoint
interface BackendUserProfile {
  _id: string; // Backend uses _id
  email: string;
  createdAt?: string;
  loginHistory?: LoginHistoryEntry[]; // Added
  displayName?: string | null; // Added
  watchlist?: string[]; // Added watchlist
  // Removed lastLoginIp, lastLoginAt
}

// Define the shape of the context value
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean; // Indicates if initial auth status (localStorage check) is loading
  isLoggingIn: boolean; // Indicates if post-login profile fetch is happening
  isLoggingOut: boolean; // Added state to track logout process
  // Allow login to optionally update user data without a new token
  login: (newToken: string | null, userData: User) => Promise<void>;
  logout: () => void;
  // Functions to manage watchlist
  addToWatchlist: (symbol: string) => Promise<void>;
  removeFromWatchlist: (symbol: string) => Promise<void>;
}

// Create the context with a default value (or undefined and check for it)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for the provider component
interface AuthProviderProps {
  children: ReactNode;
}

// Create the AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // For initial localStorage check
  const [isLoggingIn, setIsLoggingIn] = useState(false); // For post-login fetch
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Add logout state
  const router = useRouter(); // Get router instance

  const handleLogout = useCallback(() => {
    setIsLoggingOut(true); // Set flag immediately
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
    console.log("User logged out (inactive or manual).");
    router.push('/'); // Redirect to landing page on logout
    // Reset flag after a short delay to allow redirect to happen
    setTimeout(() => setIsLoggingOut(false), 50);
  }, [router]); // Add router to dependency array

  // Setup inactivity timeout hook
  // Pass the token state to enable/disable the hook
  useInactivityTimeout(handleLogout, 15 * 60 * 1000, !!token); // 15 minutes, enabled only if token exists

  // Effect for initial localStorage restoration
  useEffect(() => {
    // Check local storage for token on initial load
    let storedToken = localStorage.getItem('authToken');
    // Removed duplicate: let storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    // Clear previous potentially corrupted data first
    let parsedUser: User | null = null;
    if (storedUser) {
        try {
            parsedUser = JSON.parse(storedUser);
            // Basic check if parsedUser is actually an object with expected keys (id and email are essential)
            if (typeof parsedUser !== 'object' || parsedUser === null || !parsedUser.id || !parsedUser.email) {
                console.warn("Stored user data is invalid format (missing id or email), clearing.");
                localStorage.removeItem('authUser');
                localStorage.removeItem('authToken'); // Also clear token if user data is bad
                parsedUser = null;
                storedToken = null; // Ensure token isn't used if user data is bad
            }
        } catch (error) {
            console.error("Failed to parse stored user data, clearing storage:", error);
            localStorage.removeItem('authUser');
            localStorage.removeItem('authToken');
            parsedUser = null;
            storedToken = null; // Ensure token isn't used if user data is bad
        }
    } else {
         // If no stored user, ensure token is also cleared
         if (storedToken) {
             console.warn("Found token but no user data, clearing token.");
             localStorage.removeItem('authToken');
             storedToken = null;
         }
    }

    // Only set state if both token and valid parsed user exist
    if (storedToken && parsedUser) {
        // Basic check for watchlist existence in parsed data
        if (!parsedUser.watchlist) {
            parsedUser.watchlist = []; // Initialize if missing
        }
        // TODO: Add token validation logic here (e.g., check expiry, call a backend verify endpoint)
        setToken(storedToken);
        setUser(parsedUser);
        console.log("Restored auth state from localStorage for user:", parsedUser.email);
    } else {
        // Ensure state is null if restoration failed
        setToken(null);
        setUser(null);
    }
    setIsLoading(false); // Finished initial check
  }, []);
  // End of re-enabled block

  // Modified login function: accepts null for token if just updating user data
  const login = async (newToken: string | null, userData: User) => {
    setIsLoggingIn(true); // Indicate activity (could be login or profile update fetch)

    const tokenToUse = newToken ?? token; // Use new token if provided, else existing one

    if (!tokenToUse) {
        console.error("[AuthContext] Login/Update called without a token.");
        logout(); // Ensure clean state if no token
        setIsLoggingIn(false);
        return;
    }

    // If a new token was provided, update state and storage
    if (newToken) {
        setToken(newToken);
        localStorage.setItem('authToken', newToken);
    }

    try {
        // Always fetch the latest full user profile using the token we decided to use
        // Fetch the full user profile AFTER setting the token
        console.log("[AuthContext] Fetching full user profile after login...");
        const response = await fetch('http://localhost:5000/api/users/me', {
            headers: {
                'Authorization': `Bearer ${tokenToUse}`, // Use determined token
            },
        });
        // Type the fetched data correctly using the BackendUserProfile interface
        const fullUserData: BackendUserProfile = await response.json();

        if (!response.ok) {
            throw new Error((fullUserData as any).message || `Failed to fetch profile after login: ${response.status}`);
        }

        // Ensure fullUserData (now typed as BackendUserProfile) is valid before saving
        if (typeof fullUserData === 'object' && fullUserData !== null && fullUserData._id && fullUserData.email) {
            // Map _id to id and ensure watchlist is an array
            const frontendUser: User = {
                ...fullUserData,
                id: fullUserData._id,
                watchlist: fullUserData.watchlist || [] // Ensure watchlist is always an array
            };
            localStorage.setItem('authUser', JSON.stringify(frontendUser)); // Save mapped data with 'id' and watchlist
            setUser(frontendUser); // Set state with mapped data ('id' field and watchlist)
            console.log("[AuthContext] Full user profile fetched and context updated:", frontendUser); // Log frontendUser
        } else {
            console.error("[AuthContext] Invalid full user data received after login fetch:", fullUserData);
            logout(); // Log out if user data is bad
            return;
        }
    } catch (error) {
        console.error("[AuthContext] Error fetching profile after login or saving state:", error);
        // Clear potentially partial state
        logout(); // Log out if fetching/saving fails
    } finally {
        setIsLoggingIn(false); // Stop loading indicator regardless of outcome
    }
    // Example redirect: router.push('/dashboard');
    console.log("[AuthContext] User logged in, token and full profile set.");
  };

  // Expose the memoized logout function
  const logout = handleLogout;

  // --- Watchlist Management Functions ---
  const updateLocalUserWatchlist = (newWatchlist: string[]) => {
      setUser(currentUser => {
          if (!currentUser) return null;
          const updatedUser = { ...currentUser, watchlist: newWatchlist };
          localStorage.setItem('authUser', JSON.stringify(updatedUser)); // Update local storage too
          return updatedUser;
      });
  };

  const addToWatchlist = async (symbol: string) => {
      if (!token || !user) return; // Need token and user context
      const symbolToAdd = symbol.trim().toUpperCase();
      // Optimistic update (optional, but improves UX)
      // updateLocalUserWatchlist([...(user.watchlist || []), symbolToAdd]);

      try {
          const response = await fetch('http://localhost:5000/api/users/watchlist', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ symbol: symbolToAdd }),
          });
          const data = await response.json();
          if (!response.ok) {
              throw new Error(data.message || 'Failed to add to watchlist');
          }
          // Update state with the confirmed list from the backend
          updateLocalUserWatchlist(data.watchlist || []);
      } catch (error) {
          console.error("Error adding to watchlist:", error);
          // Revert optimistic update if it failed (if implemented)
          // updateLocalUserWatchlist(user.watchlist || []); // Revert to original
          // Optionally show an error message to the user
      }
  };

  const removeFromWatchlist = async (symbol: string) => {
      if (!token || !user) return;
      const symbolToRemove = symbol.trim().toUpperCase();
      // Optimistic update (optional)
      // const originalWatchlist = user.watchlist || [];
      // updateLocalUserWatchlist(originalWatchlist.filter(s => s !== symbolToRemove));

      try {
          const response = await fetch(`http://localhost:5000/api/users/watchlist/${symbolToRemove}`, {
              method: 'DELETE',
              headers: {
                  'Authorization': `Bearer ${token}`,
              },
          });
          const data = await response.json();
          if (!response.ok) {
              throw new Error(data.message || 'Failed to remove from watchlist');
          }
          // Update state with the confirmed list from the backend
          updateLocalUserWatchlist(data.watchlist || []);
      } catch (error) {
          console.error("Error removing from watchlist:", error);
          // Revert optimistic update if it failed (if implemented)
          // updateLocalUserWatchlist(originalWatchlist); // Revert
          // Optionally show an error message
      }
  };


  const value = {
    user,
    token,
    isLoading, // Initial load check
    isLoggingIn, // Post-login fetch check
    isLoggingOut, // Logout process check
    login,
    logout,
    addToWatchlist, // Expose watchlist functions
    removeFromWatchlist,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
