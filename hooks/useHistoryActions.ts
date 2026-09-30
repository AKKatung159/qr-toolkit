import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useToast } from '../components/Toast';
import { copyText } from '../services/clipboard';
import { shareText } from '../services/share';
import { QRHistoryItem } from '../types/qr';
import { useHistory } from './useHistory';

/** Copy / share / delete actions for history items, with toast feedback. */
export function useHistoryActions() {
  const showToast = useToast();
  const { deleteHistoryItem } = useHistory();

  const copy = useCallback((content: string) => copyText(content, showToast), [showToast]);

  const share = useCallback((content: string) => shareText(content), []);

  const confirmDelete = useCallback(
    (item: QRHistoryItem, onDeleted?: () => void) => {
      Alert.alert('Delete item?', `"${item.title}" will be removed from history.`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteHistoryItem(item.id);
            onDeleted?.();
            showToast('Deleted');
          },
        },
      ]);
    },
    [deleteHistoryItem, showToast]
  );

  return { copy, share, confirmDelete };
}
