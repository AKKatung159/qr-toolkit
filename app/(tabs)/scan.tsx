import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  ScrollView,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useIsFocused } from 'expo-router';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import {
  Camera,
  Flashlight,
  FlashlightOff,
  RefreshCw,
  Copy,
  Share2,
  ExternalLink,
  Settings,
  Trash2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { ScreenHeader } from '../../components/ScreenHeader';
import { TypeBadge } from '../../components/TypeBadge';
import { useToast } from '../../components/Toast';
import { useHistory } from '../../hooks/useHistory';
import { detectQRType, DetectedQR } from '../../services/qr';
import { copyText } from '../../services/clipboard';
import { shareText } from '../../services/share';
import { COLORS } from '../../constants/theme';
import { QRHistoryItem } from '../../types/qr';

interface ScanResult {
  data: string;
  detected: DetectedQR;
  item: QRHistoryItem;
}

export default function ScanScreen() {
  const isFocused = useIsFocused();
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  // Guards against the camera firing several events before state updates land.
  const processing = useRef(false);
  const { addHistoryItem, deleteHistoryItem } = useHistory();
  const showToast = useToast();

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
    // Only ask automatically once, when the permission status first loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permission?.status]);

  // Torch shouldn't stay on while the user is on another tab.
  useFocusEffect(useCallback(() => () => setTorch(false), []));

  // Re-check after returning from system Settings, where the user may have enabled the camera.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') getPermission();
    });
    return () => subscription.remove();
  }, [getPermission]);

  const handleBarcodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (processing.current || !data) return;
    processing.current = true;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const detected = detectQRType(data);
    const item = await addHistoryItem(
      data,
      'scanned',
      detected.type,
      detected.title,
      detected.metadata
    );
    setResult({ data, detected, item });
  };

  const resetScanner = () => {
    setResult(null);
    processing.current = false;
  };

  const handleCopy = async () => {
    if (!result) return;
    await copyText(result.data, showToast);
  };

  const handleOpenUrl = async () => {
    if (!result) return;
    let url = result.data.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Cannot open link', url);
    }
  };

  const handleDelete = () => {
    if (!result) return;
    Alert.alert('Delete item?', 'This scan will be removed from history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteHistoryItem(result.item.id);
          resetScanner();
          showToast('Deleted');
        },
      },
    ]);
  };

  if (!permission) {
    return <View className="flex-1 bg-bg" />;
  }

  if (!permission.granted) {
    const blocked = !permission.canAskAgain;
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-bg justify-center px-6">
        <View className="bg-white p-8 rounded-3xl border border-gray-100 items-center">
          <View className="w-16 h-16 rounded-full bg-primary-pastel items-center justify-center mb-4">
            <Camera size={28} color={COLORS.primary} />
          </View>
          <Text className="text-xl font-bold text-dark mb-2 text-center">
            Camera Permission Required
          </Text>
          <Text className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
            {blocked
              ? 'Camera access is turned off for QR Toolkit. Enable it in Settings to scan QR codes.'
              : 'We need camera access to scan QR codes. Your camera stream is processed locally on your device.'}
          </Text>
          {blocked ? (
            <Button
              title="Open Settings"
              onPress={() => Linking.openSettings()}
              variant="primary"
              icon={<Settings size={18} color={COLORS.white} />}
              fullWidth
            />
          ) : (
            <Button
              title="Grant Permission"
              onPress={requestPermission}
              variant="primary"
              fullWidth
            />
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <ScreenHeader
        title="Scan QR Code"
        subtitle="Align code inside the frame"
        rightElement={
          <TouchableOpacity
            onPress={() => setTorch(!torch)}
            className={`w-11 h-11 rounded-full items-center justify-center ${
              torch ? 'bg-dark' : 'bg-primary-pastel'
            }`}
            accessibilityRole="switch"
            accessibilityLabel="Flashlight"
            accessibilityState={{ checked: torch }}
          >
            {torch ? (
              <Flashlight size={20} color={COLORS.primary} />
            ) : (
              <FlashlightOff size={20} color={COLORS.black} />
            )}
          </TouchableOpacity>
        }
      />

      <View className="flex-1 relative justify-center items-center bg-black">
        {isFocused && (
          <CameraView
            style={StyleSheet.absoluteFill}
            enableTorch={torch}
            onBarcodeScanned={result ? undefined : handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          />
        )}

        {/* Framing Overlay */}
        <View className="w-64 h-64 border-4 border-primary rounded-3xl bg-transparent relative justify-center items-center">
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

      <BottomSheet
        visible={!!result}
        title="Scan Detected!"
        onClose={resetScanner}
        headerRight={result ? <TypeBadge type={result.detected.type} /> : undefined}
      >
        <ScrollView
          className="bg-gray-50 rounded-2xl mb-4 border border-gray-100"
          style={{ maxHeight: 160 }}
          contentContainerStyle={{ padding: 16 }}
        >
          <Text className="text-sm font-medium text-dark" selectable>
            {result?.data}
          </Text>
        </ScrollView>
        <Text className="text-xs text-gray-500 mb-4">Saved to history</Text>

        {result?.detected.type === 'url' && (
          <View className="mb-3">
            <Button
              title="Open Website"
              onPress={handleOpenUrl}
              variant="primary"
              icon={<ExternalLink size={18} color={COLORS.white} />}
              fullWidth
            />
          </View>
        )}

        <View className="flex-row mb-3">
          <View className="flex-1 mr-2">
            <Button
              title="Copy"
              onPress={handleCopy}
              variant="secondary"
              icon={<Copy size={18} color={COLORS.black} />}
              fullWidth
            />
          </View>
          <View className="flex-1 mr-2">
            <Button
              title="Share"
              onPress={() => result && shareText(result.data)}
              variant="dark"
              icon={<Share2 size={18} color={COLORS.white} />}
              fullWidth
            />
          </View>
          <View>
            <TouchableOpacity
              onPress={handleDelete}
              className="w-14 h-full min-h-[48px] rounded-xl bg-red-50 items-center justify-center"
              accessibilityLabel="Delete from history"
              accessibilityRole="button"
            >
              <Trash2 size={20} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <Button
          title="Scan Another Code"
          onPress={resetScanner}
          variant="ghost"
          icon={<RefreshCw size={18} color={COLORS.black} />}
          fullWidth
        />
      </BottomSheet>
    </SafeAreaView>
  );
}
