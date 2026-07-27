/**
 * useOnlineStatus.js
 * Custom React hook that tracks browser online/offline connectivity.
 * Listens to the native window 'online' and 'offline' events,
 * which are triggered when the browser's network connectivity changes.
 *
 * This is the trigger for AirGuard's offline compass fallback mode.
 */

import { useState, useEffect } from "react";

export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(() => navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return isOnline;
}
