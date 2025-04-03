import { useEffect, useRef, useCallback } from 'react';

const INACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

/**
 * Custom hook to detect user inactivity and trigger a callback.
 * @param onTimeout Callback function to execute when the timeout occurs.
 * @param timeoutDuration Duration in milliseconds after which inactivity is detected.
 * @param enabled Boolean flag to enable/disable the hook.
 */
export function useInactivityTimeout(onTimeout: () => void, timeoutDuration: number, enabled: boolean = true) {
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize the onTimeout callback to prevent unnecessary effect runs
  const memoizedOnTimeout = useCallback(onTimeout, [onTimeout]);

  const resetTimer = useCallback(() => {
    // Clear existing timer
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    // Set new timer only if enabled
    if (enabled) {
      timeoutIdRef.current = setTimeout(memoizedOnTimeout, timeoutDuration);
    }
  }, [enabled, memoizedOnTimeout, timeoutDuration]);

  const handleActivity = useCallback(() => {
    // Reset timer only if enabled
    if (enabled) {
      resetTimer();
    }
  }, [enabled, resetTimer]);

  useEffect(() => {
    if (!enabled) {
      // If disabled, clear any existing timer and remove listeners
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      // Ensure listeners are removed if hook becomes disabled
      INACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      return; // Exit early if not enabled
    }

    // Initial timer start when enabled
    resetTimer();

    // Add event listeners for user activity when enabled
    INACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Cleanup function
    return () => {
      // Clear the timer
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      // Remove event listeners
      INACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [enabled, resetTimer, handleActivity]); // Add enabled to dependencies

  // No need to return anything, the hook manages its side effects
}
