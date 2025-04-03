"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
// import { useRouter } from 'next/navigation'; // Needed for redirects

// Define the shape of the user object (adjust as needed)
interface User {
  id: string;
  email: string;
  // Add other fields like displayName, etc., if returned from backend
}

// Define the shape of the context value
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean; // Indicates if auth status is being checked initially
  login: (token: string, userData: User) => void;
  logout: () => void;
  // Add signup function if needed, or handle it separately in the signup component
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
  const [isLoading, setIsLoading] = useState(true); // Restore initial loading state
  // const router = useRouter();

  // Re-enable localStorage restoration
  useEffect(() => {
    // Check local storage for token on initial load
    let storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    // Clear previous potentially corrupted data first
    let parsedUser: User | null = null;
    if (storedUser) {
        try {
            parsedUser = JSON.parse(storedUser);
            // Basic check if parsedUser is actually an object with expected keys
            if (typeof parsedUser !== 'object' || parsedUser === null || !parsedUser.id || !parsedUser.email) {
                console.warn("Stored user data is invalid format, clearing.");
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

  const login = (newToken: string, userData: User) => {
    try {
        // Ensure userData is a valid object before stringifying
        if (typeof userData === 'object' && userData !== null) {
            localStorage.setItem('authToken', newToken);
            localStorage.setItem('authUser', JSON.stringify(userData));
            setToken(newToken);
            setUser(userData);
        } else {
            console.error("Login function received invalid userData:", userData);
            // Handle error appropriately, maybe logout?
            logout(); // Log out if user data is bad
            return;
        }
    } catch (error) {
        console.error("Error saving auth state to localStorage:", error);
        // Handle potential storage errors (e.g., quota exceeded)
        logout(); // Log out if saving fails
        return;
    }
    // Example redirect: router.push('/dashboard');
    console.log("User logged in, token set.");
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
    // Example redirect: router.push('/login');
    console.log("User logged out.");
    // Optionally: Call a backend logout endpoint if necessary
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
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
