'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hr ago`;
}

interface LastUpdatedContextValue {
  lastUpdatedText: string;
  syncing: boolean;
  refresh: () => void;
}

const LastUpdatedContext = createContext<LastUpdatedContextValue>({
  lastUpdatedText: 'just now',
  syncing: false,
  refresh: () => {},
});

export function useLastUpdated() {
  return useContext(LastUpdatedContext);
}

export function useLastUpdatedProvider() {
  const [timestamp, setTimestamp] = useState(() => Date.now());
  const [text, setText] = useState('just now');
  const [syncing, setSyncing] = useState(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Live-update the text every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      setText(timeAgo(timestamp));
    }, 30_000);
    // Also update immediately when timestamp changes
    setText(timeAgo(timestamp));
    return () => clearInterval(interval);
  }, [timestamp]);

  const refresh = useCallback(() => {
    setSyncing(true);
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      setTimestamp(Date.now());
      setSyncing(false);
    }, 1200);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, []);

  return { lastUpdatedText: text, syncing, refresh, Provider: LastUpdatedContext.Provider };
}

export { LastUpdatedContext };
