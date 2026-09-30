import AsyncStorage from '@react-native-async-storage/async-storage';
import { QRHistoryItem, QRMode, QRType } from '../types/qr';
import { detectQRType } from './qr';

const STORAGE_KEY = '@qr_toolkit_history_v1';

export async function getHistory(): Promise<QRHistoryItem[]> {
  try {
    const jsonStr = await AsyncStorage.getItem(STORAGE_KEY);
    if (!jsonStr) return [];
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error reading QR history:', error);
    return [];
  }
}

export async function addHistoryItem(
  content: string,
  mode: QRMode,
  customType?: QRType,
  customTitle?: string,
  metadata?: any
): Promise<QRHistoryItem> {
  const history = await getHistory();
  const detected = detectQRType(content);

  const newItem: QRHistoryItem = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
    type: customType || detected.type,
    content,
    title: customTitle || detected.title,
    mode,
    createdAt: new Date().toISOString(),
    metadata: metadata || detected.metadata,
  };

  const updated = [
    newItem,
    ...history.filter((item) => item.content !== content || item.mode !== mode),
  ];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newItem;
}

export async function deleteHistoryItem(id: string): Promise<QRHistoryItem[]> {
  const history = await getHistory();
  const updated = history.filter((item) => item.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
