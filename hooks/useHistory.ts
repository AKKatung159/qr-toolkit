import { useState, useEffect, useCallback } from 'react';
import { QRHistoryItem } from '../types/qr';
import { getHistory, addHistoryItem, deleteHistoryItem, clearHistory } from '../services/history';

export function useHistory() {
  const [history, setHistory] = useState<QRHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshHistory = useCallback(async () => {
    setLoading(true);
    const data = await getHistory();
    setHistory(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const add = async (...args: Parameters<typeof addHistoryItem>) => {
    const newItem = await addHistoryItem(...args);
    await refreshHistory();
    return newItem;
  };

  const remove = async (id: string) => {
    const updated = await deleteHistoryItem(id);
    setHistory(updated);
  };

  const clear = async () => {
    await clearHistory();
    setHistory([]);
  };

  return {
    history,
    loading,
    refreshHistory,
    addHistoryItem: add,
    deleteHistoryItem: remove,
    clearHistory: clear,
  };
}
