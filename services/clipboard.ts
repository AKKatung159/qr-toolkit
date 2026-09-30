import { Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';

// Android 13+ (API 33) shows its own "copied" confirmation, so an app toast would duplicate it.
const systemShowsCopyFeedback = Platform.OS === 'android' && Number(Platform.Version) >= 33;

/** Copies text, calling `notify` only when the OS doesn't already confirm the copy. */
export async function copyText(text: string, notify: (message: string) => void): Promise<void> {
  await Clipboard.setStringAsync(text);
  if (!systemShowsCopyFeedback) notify('Copied to clipboard');
}
