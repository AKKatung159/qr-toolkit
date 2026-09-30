import { Share } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

/** The subset of react-native-qrcode-svg's ref that we use. */
export interface QRCodeRef {
  toDataURL: (callback: (base64: string) => void) => void;
}

/** Renders the QR to a PNG in the cache directory and returns its file URI. */
export function saveQrImage(ref: QRCodeRef | null): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!ref) {
      reject(new Error('QR code is not ready'));
      return;
    }
    ref.toDataURL(async (data) => {
      try {
        const fileUri = `${FileSystem.cacheDirectory}qr_code_${Date.now()}.png`;
        await FileSystem.writeAsStringAsync(fileUri, data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        resolve(fileUri);
      } catch (err) {
        reject(err);
      }
    });
  });
}

/** Opens the native share sheet with the QR image, falling back to plain text. */
export async function shareQrImage(
  ref: QRCodeRef | null,
  fallbackText: string,
  dialogTitle = 'Share QR Code'
): Promise<void> {
  try {
    const fileUri = await saveQrImage(ref);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, { mimeType: 'image/png', dialogTitle });
      return;
    }
  } catch (error) {
    console.warn('Could not share QR image, falling back to text:', error);
  }
  await shareText(fallbackText);
}

export async function shareText(message: string): Promise<void> {
  try {
    await Share.share({ message });
  } catch (error) {
    console.warn('Share failed:', error);
  }
}
