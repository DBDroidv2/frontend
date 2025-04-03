'use client';

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext'; // Import the useAuth hook
import { debounce } from 'lodash-es'; // Using lodash for debouncing
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from "@/components/ui/popover"; // Import Popover (added Anchor)
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command"; // Use Command for list display
import { Star, RefreshCw } from 'lucide-react'; // Import Star and Refresh icon
import { cn } from '@/lib/utils'; // Import cn utility for conditional classes
import { // Import Tooltip components needed for refresh button
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

// Define interfaces for the expected API response structure
interface TimeSeriesEntry {
    '1. open': string;
    '2. high': string;
    '3. low': string;
    '4. close': string;
    '5. volume': string;
}

interface TimeSeriesData {
    [dateTime: string]: TimeSeriesEntry;
}

interface StockApiResponse {
    'Meta Data'?: {
        '1. Information': string;
        '2. Symbol': string;
        '3. Last Refreshed': string;
        // '4. Interval': string; // Interval is not present in daily data meta
        '4. Output Size': string; // Index changes from intraday
        '5. Time Zone': string; // Index changes from intraday
    };
    'Time Series (Daily)'?: TimeSeriesData; // Specific key for daily data
    'Error Message'?: string;
    'Note'?: string;
}

// Define interfaces for Symbol Search API response
interface BestMatch {
    '1. symbol': string;
    '2. name': string;
    '3. type': string;
    '4. region': string;
    '5. marketOpen': string;
    '6. marketClose': string;
    '7. timezone': string;
    '8. currency': string;
    '9. matchScore': string;
}

interface SymbolSearchResponse {
    bestMatches?: BestMatch[];
    'Error Message'?: string;
    'Note'?: string;
}


export function StockWidget() {
    const [symbol, setSymbol] = useState<string>('IBM'); // Default symbol
    const [inputSymbol, setInputSymbol] = useState<string>('IBM');
    const [stockData, setStockData] = useState<StockApiResponse | null>(null);
    const [latestPrice, setLatestPrice] = useState<string | null>(null);
    const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false); // Loading daily data (initial or standard fetch)
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false); // State for refresh button loading
    const [error, setError] = useState<string | null>(null); // Error for daily data
    const { token, user, addToWatchlist, removeFromWatchlist } = useAuth(); // Get user and watchlist functions

    // State for symbol search
    const [searchResults, setSearchResults] = useState<BestMatch[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [showSearchResults, setShowSearchResults] = useState<boolean>(false);

    // --- Fetch Daily Stock Data ---
    const fetchStockData = useCallback(async (currentSymbol: string, forceRefresh = false) => {
        // Close search results when fetching daily data for a selected symbol
        setShowSearchResults(false);
        setSearchResults([]); // Clear results

        if (!currentSymbol || !token) {
            setError('Symbol is required and user must be logged in.');
            setStockData(null);
            setLatestPrice(null);
            setLastRefreshed(null);
            return;
        }

        if (forceRefresh) {
            setIsRefreshing(true); // Indicate refresh in progress
        } else {
            setIsLoading(true); // Indicate standard load
        }
        setError(null);
        // Don't clear previous data immediately on refresh, only if fetch fails later
        // setStockData(null);
        setLatestPrice(null);
        setLastRefreshed(null);

        try {
            // Adjust URL to include forceRefresh if needed
            let apiUrl = `http://localhost:5000/api/stocks/daily?symbol=${currentSymbol.toUpperCase()}&outputsize=compact`;
            if (forceRefresh) {
                apiUrl += '&forceRefresh=true';
            }
            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            // Handle specific 429 Rate Limit error first
            if (response.status === 429) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'API rate limit exceeded.'); // Use message from backend
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data: StockApiResponse & { Information?: string } = await response.json(); // Add Information to type

            if (data['Error Message']) {
                throw new Error(`API Error: ${data['Error Message']}`);
            }
            // Handle informational message from free tier keys
            if (data['Information']) {
                 throw new Error(`API Info: ${data['Information']}`); // Treat info message as an error for display
            }
             if (data['Note']) {
                console.warn("Alpha Vantage API Note:", data['Note']);
                // Potentially display a less severe warning to the user if needed
            }


            setStockData(data);

            // Extract the latest price and time for Daily data
            const metaData = data['Meta Data'];
            const timeSeries = data['Time Series (Daily)']; // Use the specific key

            if (metaData && timeSeries) {
                const latestDate = Object.keys(timeSeries)[0]; // First key is the latest date
                if (latestDate && timeSeries[latestDate]) {
                    setLatestPrice(timeSeries[latestDate]['4. close']);
                    setLastRefreshed(latestDate); // Use the actual data point date
                } else {
                     setLatestPrice(null);
                     setLastRefreshed(metaData['3. Last Refreshed'] || null); // Fallback to metadata refresh time (less ideal for daily)
                }
            } else {
                 setLatestPrice(null);
                 setLastRefreshed(null);
                 // Throw error if expected data keys are missing even without an explicit error message
                 throw new Error("Could not parse price/time from API response.");
            }


        } catch (err: any) {
            console.error("Failed to fetch stock data:", err);
            setError(err.message || 'Failed to fetch stock data.');
            setStockData(null);
            setLatestPrice(null);
            setLastRefreshed(null);
            if (forceRefresh) setStockData(null); // Clear data only if refresh fails
        } finally {
            setIsLoading(false); // Stop initial/standard loading
            setIsRefreshing(false); // Stop refresh loading
        }
    }, [token]); // Dependency on token

    // --- Symbol Search Logic ---
    const fetchSearchResults = useCallback(async (keywords: string) => {
        if (!keywords || keywords.length < 2 || !token) { // Require minimum length for search
            setSearchResults([]);
            setShowSearchResults(false);
            setSearchError(null);
            return;
        }

        setIsSearching(true);
        setSearchError(null);

        try {
            const response = await fetch(`http://localhost:5000/api/stocks/search?keywords=${keywords}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            // Handle specific 429 Rate Limit error first
            if (response.status === 429) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'API rate limit exceeded.'); // Use message from backend
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Search HTTP error! status: ${response.status}`);
            }

            const data: SymbolSearchResponse = await response.json();

            if (data['Error Message']) {
                throw new Error(`Search API Error: ${data['Error Message']}`);
            }
            if (data['Note']) {
                console.warn("Alpha Vantage API Note (Search):", data['Note']);
                // Handle potential rate limiting notes if necessary
            }

            setSearchResults(data.bestMatches || []);
            setShowSearchResults(true); // Show results when fetch is successful

        } catch (err: any) {
            console.error("Failed to fetch search results:", err);
            setSearchError(err.message || 'Failed to search symbols.');
            setSearchResults([]);
            setShowSearchResults(true); // Keep popover open to show error
        } finally {
            setIsSearching(false);
        }
    }, [token]);

    // Debounced fetch function for daily data
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedFetchDailyData = useCallback(debounce(fetchStockData, 750), [fetchStockData]);

    // Debounced fetch function for search results
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedFetchSearch = useCallback(debounce(fetchSearchResults, 400), [fetchSearchResults]); // Shorter delay for search

    // Effect to fetch daily data when symbol changes (debounced)
    useEffect(() => {
        // Only fetch if symbol is not empty
        if (symbol) {
            debouncedFetchDailyData(symbol);
        }
        // Cleanup function to cancel debounce on unmount or symbol change
        return () => {
            debouncedFetchDailyData.cancel();
        };
    }, [symbol, debouncedFetchDailyData]);

    // Handle input change for search
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setInputSymbol(value);
        // Trigger debounced search if value is not empty
        if (value.trim()) {
            debouncedFetchSearch(value);
        } else {
            // Clear results and hide popover if input is empty
            setSearchResults([]);
            setShowSearchResults(false);
            setSearchError(null);
            debouncedFetchSearch.cancel(); // Cancel any pending search
        }
    };

    // Handle selecting a symbol from search results
    const handleSelectSymbol = (selectedSymbol: string) => {
        setInputSymbol(selectedSymbol); // Update input field
        setSymbol(selectedSymbol); // Trigger daily data fetch for the selected symbol
        setShowSearchResults(false); // Close the popover
        setSearchResults([]); // Clear search results
        setSearchError(null);
        debouncedFetchSearch.cancel(); // Cancel any pending search fetch
    };

    // Handle clicking the explicit search button (fetches daily data for current input)
    const handleSearchClick = () => {
        setSymbol(inputSymbol); // Trigger daily data fetch for whatever is in the input
        setShowSearchResults(false); // Close search results if open
        setSearchResults([]);
        setSearchError(null);
        debouncedFetchSearch.cancel();
    };

    // Handle key press (Enter) in the input field
    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearchClick(); // Trigger daily data fetch on Enter
        }
    };

    // Handle focus on input to potentially show results again if they exist
    const handleInputFocus = () => {
        if (searchResults.length > 0 || searchError) {
            setShowSearchResults(true);
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Daily Stock Tracker</CardTitle> {/* Updated Title */}
                <CardDescription>Search for a symbol or view the latest daily closing price.</CardDescription> {/* Updated Description */}
                {/* Wrap input and button in Popover */}
                <Popover open={showSearchResults} onOpenChange={setShowSearchResults}>
                    <div className="flex space-x-2 pt-2 relative"> {/* Added relative positioning */}
                        {/* Anchor the Popover to the input */}
                        <PopoverAnchor asChild>
                            <Input
                                placeholder="Search symbol (e.g., MSFT)"
                                value={inputSymbol}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                                onFocus={handleInputFocus} // Show popover on focus if results exist
                                className="flex-grow"
                                autoComplete="off" // Prevent browser autocomplete interference
                            />
                        </PopoverAnchor>
                        <Button onClick={handleSearchClick} disabled={isLoading || isRefreshing || isSearching}>
                            {isLoading ? 'Loading...' : (isRefreshing ? 'Refreshing...' : (isSearching ? 'Searching...' : 'Get Price'))}
                        </Button>
                         {/* Add Refresh Button */}
                         <TooltipProvider delayDuration={100}>
                             <Tooltip>
                                 <TooltipTrigger asChild>
                                     <Button
                                         variant="ghost"
                                         size="icon"
                                         onClick={() => fetchStockData(symbol, true)} // Fetch current symbol with forceRefresh
                                         disabled={isLoading || isRefreshing || isSearching || !symbol} // Disable if no symbol selected
                                         className="h-10 w-10 ml-1" // Match input height
                                     >
                                         <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                         <span className="sr-only">Refresh Price</span>
                                     </Button>
                                 </TooltipTrigger>
                                 <TooltipContent>
                                     <p>Refresh Price Data</p>
                                 </TooltipContent>
                             </Tooltip>
                         </TooltipProvider>
                    </div>
                    <PopoverContent
                        className="w-[--radix-popover-trigger-width] p-0" // Match input width, remove padding
                        align="start" // Align start edge with input
                        onOpenAutoFocus={(e) => e.preventDefault()} // Prevent focus stealing
                        onCloseAutoFocus={(e) => e.preventDefault()} // Prevent focus stealing
                    >
                        <Command shouldFilter={false} > {/* Disable Command's internal filtering */}
                            {/* Optional: Add CommandInput if you want filtering within results */}
                            {/* <CommandInput placeholder="Filter results..." /> */}
                            <CommandList>
                                {isSearching && <CommandItem disabled>Searching...</CommandItem>}
                                <CommandEmpty>
                                    {searchError ? <span className="text-red-500 text-xs p-2 block">{searchError}</span> : 'No results found.'}
                                </CommandEmpty>
                                {searchResults.map((match) => (
                                    <CommandItem
                                        key={match['1. symbol']}
                                        value={`${match['1. symbol']} ${match['2. name']}`} // Value for potential filtering
                                        onSelect={() => handleSelectSymbol(match['1. symbol'])}
                                        className="cursor-pointer"
                                    >
                                        <div className="flex justify-between w-full">
                                            <span>
                                                <span className="font-medium">{match['1. symbol']}</span>
                                                <span className="text-muted-foreground ml-2 text-xs">
                                                    {match['2. name']} ({match['4. region']})
                                                </span>
                                            </span>
                                            <span className="text-xs text-muted-foreground">{match['8. currency']}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                )}
                {error && !isLoading && (
                    <p className="text-red-500 text-sm">{error}</p>
                )}
                {!isLoading && !error && stockData && latestPrice && (
                    <div>
                        <h3 className="text-lg font-semibold">{stockData['Meta Data']?.['2. Symbol'] || symbol.toUpperCase()}</h3>
                        <p className="text-2xl font-bold">${parseFloat(latestPrice).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                            As of close on: {lastRefreshed ? new Date(lastRefreshed + 'T00:00:00').toLocaleDateString() : 'N/A'} {/* Format date only */}
                        </p>
                        {/* Add/Remove Watchlist Button */}
                        {stockData?.['Meta Data']?.['2. Symbol'] && (
                             <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2"
                                onClick={() => {
                                    const currentSymbol = stockData['Meta Data']?.['2. Symbol'];
                                    if (!currentSymbol) return;
                                    const isWatched = user?.watchlist?.includes(currentSymbol);
                                    if (isWatched) {
                                        removeFromWatchlist(currentSymbol);
                                    } else {
                                        addToWatchlist(currentSymbol);
                                    }
                                }}
                            >
                                <Star className={cn(
                                    "mr-2 h-4 w-4",
                                    user?.watchlist?.includes(stockData['Meta Data']?.['2. Symbol'] || '')
                                        ? "text-yellow-400 fill-yellow-400" // Filled star if watched
                                        : "text-muted-foreground" // Outline star if not watched
                                )} />
                                {user?.watchlist?.includes(stockData['Meta Data']?.['2. Symbol'] || '') ? 'Remove from Watchlist' : 'Add to Watchlist'}
                            </Button>
                        )}
                         {stockData['Note'] && (
                            <p className="text-xs text-yellow-600 mt-1">Note: {stockData['Note']}</p>
                        )}
                    </div>
                )}
                 {!isLoading && !error && stockData && !latestPrice && !stockData['Error Message'] && (
                     <p className="text-sm text-muted-foreground">Data received, but couldn't determine the latest price.</p>
                 )}
                {!isLoading && !error && !stockData && (
                    <p className="text-sm text-muted-foreground">Enter a symbol and click Search.</p>
                )}
            </CardContent>
        </Card>
    );
}
