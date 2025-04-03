'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, LineChart, RefreshCw } from 'lucide-react'; // Added RefreshCw icon
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface WatchlistItemData {
    symbol: string;
    price: string | null;
    lastRefreshed: string | null; // Date string
    isLoading: boolean;
    error: string | null;
}

// Interface for the daily stock data API response (subset needed here)
interface DailyStockApiResponse {
    'Meta Data'?: {
        '2. Symbol': string;
        '3. Last Refreshed': string;
    };
    'Time Series (Daily)'?: {
        [date: string]: {
            '4. close': string;
        };
    };
    'Error Message'?: string;
    'Note'?: string; // Handle potential API notes
}

export function WatchlistWidget() {
    const { user, token, removeFromWatchlist } = useAuth();
    const [watchlistData, setWatchlistData] = useState<WatchlistItemData[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false); // State for refresh button

    // Fetch price for a single symbol, now accepts forceRefresh
    const fetchPriceForSymbol = useCallback(async (symbol: string, forceRefresh = false): Promise<Partial<WatchlistItemData>> => {
        if (!token) return { isLoading: false, error: 'Not authenticated' };

        try {
            let apiUrl = `http://localhost:5000/api/stocks/daily?symbol=${symbol}&outputsize=compact`;
            if (forceRefresh) {
                apiUrl += '&forceRefresh=true';
            }
            const response = await fetch(apiUrl, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            // Handle specific 429 Rate Limit error first
            if (response.status === 429) {
                const errorData = await response.json();
                // Return specific error structure for the watchlist item
                return { isLoading: false, error: errorData.message || 'Rate limit exceeded' };
            }

            const data: DailyStockApiResponse & { Information?: string } = await response.json(); // Add Information to type

            // Handle other errors after checking rate limit
            if (!response.ok || data['Error Message']) {
                throw new Error(data['Error Message'] || `HTTP error ${response.status}`);
            }
            // Handle informational message from free tier keys
            if (data['Information']) {
                 // Return specific error structure for the watchlist item
                 return { isLoading: false, error: `API Info: ${data['Information']}` };
            }
             if (data['Note']) {
                 console.warn(`Watchlist fetch note for ${symbol}: ${data['Note']}`);
                 // Don't treat note as a fatal error for price display
             }


            const timeSeries = data['Time Series (Daily)'];
            if (timeSeries) {
                const latestDate = Object.keys(timeSeries)[0];
                if (latestDate && timeSeries[latestDate]) {
                    return {
                        price: parseFloat(timeSeries[latestDate]['4. close']).toFixed(2),
                        lastRefreshed: latestDate,
                        isLoading: false,
                        error: null
                    };
                }
            }
            // If data structure is unexpected or no time series data
            return { price: null, lastRefreshed: data['Meta Data']?.['3. Last Refreshed'] || null, isLoading: false, error: 'Could not parse price/time' }; // Updated error message

        } catch (err: any) {
            console.error(`Error fetching price for ${symbol}:`, err);
            return { isLoading: false, error: err.message || 'Fetch failed' };
        }
    }, [token]);

    // Function to fetch/refresh all watchlist prices
    const refreshWatchlistPrices = useCallback((forceRefresh = false) => {
        if (!user?.watchlist || !token) {
            setWatchlistData([]);
            setIsInitialLoading(false); // Ensure loading stops if no watchlist/token
            setIsRefreshing(false);
            setIsInitialLoading(false);
            return;
        }

        if (forceRefresh) {
            setIsRefreshing(true); // Set refreshing state
        } else {
            setIsInitialLoading(true); // Set initial loading state
        }

        const symbols = user.watchlist;

        // Initialize state
        const initialData: WatchlistItemData[] = symbols.map(symbol => ({
            symbol,
            price: null,
            lastRefreshed: null,
            isLoading: !forceRefresh, // Only set initial loading if not forcing refresh
            error: null
        }));
        // Only reset state fully on initial load, not on refresh (to avoid flicker)
        if (!forceRefresh) {
            setWatchlistData(initialData);
        } else {
             // On refresh, just mark existing items as loading
             setWatchlistData(currentData => currentData.map(item => ({ ...item, isLoading: true, error: null })));
        }


        // Fetch prices concurrently, passing forceRefresh flag
        Promise.all(symbols.map(symbol => fetchPriceForSymbol(symbol, forceRefresh)))
            .then(results => {
                // Create a map for efficient lookup
                const resultMap = new Map<string, Partial<WatchlistItemData>>();
                results.forEach((result, index) => {
                    resultMap.set(symbols[index], result);
                });

                setWatchlistData(currentData =>
                    currentData.map(item => ({
                        ...item,
                        ...(resultMap.get(item.symbol) || {}), // Merge fetched data for this symbol
                        isLoading: false // Mark as not loading after fetch attempt
                    }))
                );
            })
            .catch(error => {
                // This catch might not be strictly necessary if fetchPriceForSymbol handles its errors
                console.error("Error fetching watchlist prices:", error);
                // Mark all as errored?
                setWatchlistData(currentData =>
                    currentData.map(item => ({ ...item, isLoading: false, error: 'Batch fetch failed' }))
                );
            })
            .finally(() => {
                setIsInitialLoading(false); // Stop initial loading
                setIsRefreshing(false); // Stop refresh loading
            });
    }, [user?.watchlist, token, fetchPriceForSymbol]);

    // Initial fetch on mount
    useEffect(() => {
        refreshWatchlistPrices(false); // Initial fetch, don't force refresh
    }, [refreshWatchlistPrices]); // Depend on the memoized function

    // Handler for the main refresh button
    const handleRefreshAll = () => {
        refreshWatchlistPrices(true); // Force refresh all
    };

    const handleRemoveClick = async (symbol: string) => {
        // Optionally add a confirmation dialog here
        await removeFromWatchlist(symbol);
        // The useEffect hook listening to user.watchlist will handle the UI update
    };

    return (
        <Card className="lg:col-span-2"> {/* Make it wider */}
            <CardHeader>
                 <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>My Watchlist</CardTitle>
                        <CardDescription>Track your favorite stock symbols.</CardDescription>
                    </div>
                     {/* Add Refresh Button for Watchlist */}
                     {user?.watchlist && user.watchlist.length > 0 && (
                         <TooltipProvider delayDuration={100}>
                             <Tooltip>
                                 <TooltipTrigger asChild>
                                     <Button
                                         variant="ghost"
                                         size="icon"
                                         onClick={handleRefreshAll}
                                         disabled={isInitialLoading || isRefreshing}
                                         className="h-8 w-8"
                                     >
                                         <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                         <span className="sr-only">Refresh Watchlist Prices</span>
                                     </Button>
                                 </TooltipTrigger>
                                 <TooltipContent>
                                     <p>Refresh All Prices</p>
                                 </TooltipContent>
                             </Tooltip>
                         </TooltipProvider>
                     )}
                 </div>
            </CardHeader>
            <CardContent>
                {(isInitialLoading || isRefreshing) && (!watchlistData || watchlistData.length === 0) && ( // Show loading if refreshing empty list too
                     <p className="text-sm text-muted-foreground">Loading watchlist...</p>
                )}
                {!isInitialLoading && (!user?.watchlist || user.watchlist.length === 0) && (
                    <p className="text-sm text-muted-foreground">Your watchlist is empty. Add symbols using the Stock Tracker.</p>
                )}

                {watchlistData.length > 0 && (
                    <div className="space-y-3">
                        {watchlistData.map((item) => (
                            <div key={item.symbol} className="flex items-center justify-between p-2 border rounded hover:bg-muted/50">
                                <div className="flex flex-col">
                                    <span className="font-medium">{item.symbol}</span>
                                    {item.isLoading && <Skeleton className="h-5 w-16 mt-1" />}
                                    {item.error && !item.isLoading && <span className="text-xs text-red-500 mt-1">Error: {item.error}</span>}
                                    {!item.isLoading && !item.error && item.price && (
                                        <span className="text-lg font-semibold">${item.price}</span>
                                    )}
                                     {!item.isLoading && !item.error && !item.price && (
                                         <span className="text-sm text-muted-foreground mt-1">Price N/A</span>
                                     )}
                                </div>
                                <div className="flex items-center space-x-2">
                                     {item.lastRefreshed && !item.isLoading && !item.error && (
                                         <TooltipProvider delayDuration={100}>
                                             <Tooltip>
                                                 <TooltipTrigger asChild>
                                                     <span className="text-xs text-muted-foreground cursor-default">
                                                         {new Date(item.lastRefreshed + 'T00:00:00').toLocaleDateString()}
                                                     </span>
                                                 </TooltipTrigger>
                                                 <TooltipContent>
                                                     <p>Last Price Date</p>
                                                 </TooltipContent>
                                             </Tooltip>
                                         </TooltipProvider>
                                     )}
                                    <TooltipProvider delayDuration={100}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveClick(item.symbol)}
                                                    className="h-8 w-8"
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                    <span className="sr-only">Remove {item.symbol}</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Remove from Watchlist</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
