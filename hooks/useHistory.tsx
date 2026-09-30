import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { QRHistoryItem } from '../types/qr';
import {
  getHistory,
  addHistoryItem as addItem,
  deleteHistoryItem as deleteItem,
  clearHistory as clearAll,
} from '../services/history';

interface HistoryContextValue {
  history: QRHistoryItem[];
  loading: boolean;
  refreshHistory: () => Promise<void>;
  addHistoryItem: (...args: Parameters<typeof addItem>) => Promise<QRHistoryItem>;
  deleteHistoryItem: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const HistoryContext = createContext<HistoryContextValue | null>(null);

/**
 * Holds history in one place so every tab sees the same list.
 * Tabs stay mounted, so per-screen state would go stale after a scan/generate.
 */
export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<QRHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshHistory = useCallback(async () => {
    setLoading(true);
    const data = await getHistory();
    setHistory(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    getHistory().then((data) => {
      setHistory(data);
      setLoading(false);
    });
  }, []);

  const addHistoryItem = useCallback(
    async (...args: Parameters<typeof addItem>) => {
      const newItem = await addItem(...args);
      await refreshHistory();
      return newItem;
    },
    [refreshHistory]
  );

  const deleteHistoryItem = useCallback(async (id: string) => {
    const updated = await deleteItem(id);
    setHistory(updated);
  }, []);

  const clearHistory = useCallback(async () => {
    await clearAll();
    setHistory([]);
  }, []);

  const value = useMemo(
    () => ({ history, loading, refreshHistory, addHistoryItem, deleteHistoryItem, clearHistory }),
    [history, loading, refreshHistory, addHistoryItem, deleteHistoryItem, clearHistory]
  );

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}

export function useHistory(): HistoryContextValue {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used inside <HistoryProvider>');
  }
  return context;
}
