import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Linking,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  Flashlight,
  FlashlightOff,
  RefreshCw,
  Copy,
  Share2,
  ExternalLink,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

import { Button } from '../../components/Button';
import { ScreenHeader } from '../../components/ScreenHeader';
import { TypeBadge } from '../../components/TypeBadge';
import { useHistory } from '../../hooks/useHistory';
import { detectQRType } from '../../services/qr';
import { COLORS } from '../../constants/theme';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const { addHistoryItem } = useHistory();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned || !data) return;
    setScanned(true);
    setScanResult(data);

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    const detected = detectQRType(data);
    await addHistoryItem(data, 'scanned', detected.type, detected.title, detected.metadata);
  };

  const handleCopy = async () => {
    if (scanResult) {
      await Clipboard.setStringAsync(scanResult);
      Alert.alert('Copied!', 'Result copied to clipboard.');
    }
  };

  const handleShare = async () => {
    if (scanResult) {
      try {
        await Share.share({ message: scanResult });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleOpenUrl = async () => {
    if (!scanResult) return;
    let url = scanResult.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', `Cannot open URL: ${url}`);
    }
  };

  if (!permission) {
    return <View className="flex-1 bg-[#FFF9F5]" />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-[#FFF9F5] justify-center px-6">
        <View className="bg-white p-8 rounded-3xl border border-gray-100 items-center">
          <Text className="text-xl font-bold text-[#171717] mb-2 text-center">
            Camera Permission Required
          </Text>
          <Text className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
            We need camera access to scan QR codes. Your camera stream is processed locally on your
            device.
          </Text>
          <Button
            title="Grant Permission"
            onPress={requestPermission}
            variant="primary"
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  const detectedInfo = scanResult ? detectQRType(scanResult) : null;

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScreenHeader
        title="Scan QR Code"
        subtitle="Align code inside the frame"
        rightElement={
          <TouchableOpacity
            onPress={() => setTorch(!torch)}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            {torch ? (
              <Flashlight size={20} color="#FF8A3D" />
            ) : (
              <FlashlightOff size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        }
      />

      <View className="flex-1 relative justify-center items-center">
        <CameraView
          style={StyleSheet.absoluteFill}
          enableTorch={torch}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        />

        {/* Framing Overlay */}
        <View className="w-64 h-64 border-4 border-[#FF8A3D] rounded-3xl bg-transparent relative justify-center items-center">
          <View
            className="w-full h-1 absolute top-1/2"
            style={{ backgroundColor: 'rgba(255,138,61,0.4)' }}
          />
        </View>
        <Text
          className="text-white text-xs font-semibold mt-6 px-4 py-2 rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        >
          Scanning automatically...
        </Text>
      </View>

      {/* Result Sheet Modal */}
      <Modal visible={scanned} transparent animationType="slide">
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-t-3xl p-6 border-t border-gray-100">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-[#171717]">Scan Detected!</Text>
              <TouchableOpacity
                onPress={() => setScanned(false)}
                className="p-2 rounded-full bg-gray-100"
              >
                <X size={18} color={COLORS.darkGray} />
              </TouchableOpacity>
            </View>

            {detectedInfo && (
              <View className="mb-4">
                <TypeBadge type={detectedInfo.type} />
              </View>
            )}

            <View className="bg-gray-50 p-4 rounded-2xl mb-6 border border-gray-100">
              <Text className="text-sm font-medium text-[#171717]">{scanResult}</Text>
            </View>

            <View className="space-y-3">
              {detectedInfo?.type === 'url' && (
                <View className="mb-2">
                  <Button
                    title="Open Website"
                    onPress={handleOpenUrl}
                    variant="primary"
                    icon={<ExternalLink size={18} color="#FFF" />}
                    fullWidth
                  />
                </View>
              )}

              <View className="flex-row space-x-3 mb-3">
                <View className="flex-1 mr-2">
                  <Button
                    title="Copy Text"
                    onPress={handleCopy}
                    variant="secondary"
                    icon={<Copy size={18} color="#171717" />}
                    fullWidth
                  />
                </View>
                <View className="flex-1">
                  <Button
                    title="Share"
                    onPress={handleShare}
                    variant="dark"
                    icon={<Share2 size={18} color="#FFF" />}
                    fullWidth
                  />
                </View>
              </View>

              <Button
                title="Scan Another Code"
                onPress={() => {
                  setScanned(false);
                  setScanResult(null);
                }}
                variant="ghost"
                icon={<RefreshCw size={18} color="#171717" />}
                fullWidth
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
