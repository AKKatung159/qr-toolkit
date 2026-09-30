import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Pressable, Alert, Linking, ScrollView, AppState } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
import Svg, { Path } from 'react-native-svg';

import { BottomSheet } from '../../components/BottomSheet';
import { Button, buttonIconColor } from '../../components/Button';
import { Text } from '../../components/Text';
import { TypeBadge } from '../../components/TypeBadge';
import { useToast } from '../../components/Toast';
import { useHistory } from '../../hooks/useHistory';
import { detectQRType, DetectedQR } from '../../services/qr';
import { copyText } from '../../services/clipboard';
import { shareText } from '../../services/share';
import { COLORS } from '../../constants/theme';
import { ICON_STROKE } from '../../constants/qrTypes';
import { QRHistoryItem } from '../../types/qr';

interface ScanResult {
  data: string;
  detected: DetectedQR;
  item: QRHistoryItem;
}

const FRAME_SIZE = 256;
const FRAME_RADIUS = 24;
const SCRIM = 'rgba(23,23,23,0.62)';

/** SVG path for a square with rounded corners, used to cut the window out of the scrim. */
function roundedRectPath(x: number, y: number, size: number, r: number): string {
  const right = x + size;
  const bottom = y + size;
  return [
    `M${x + r} ${y}`,
    `H${right - r}`,
    `A${r} ${r} 0 0 1 ${right} ${y + r}`,
    `V${bottom - r}`,
    `A${r} ${r} 0 0 1 ${right - r} ${bottom}`,
    `H${x + r}`,
    `A${r} ${r} 0 0 1 ${x} ${bottom - r}`,
    `V${y + r}`,
    `A${r} ${r} 0 0 1 ${x + r} ${y}`,
    'Z',
  ].join(' ');
}

/** One L-shaped corner of the viewfinder. */
function Corner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const top = position[0] === 't';
  const left = position[1] === 'l';
  return (
    <View
      style={{
        position: 'absolute',
        width: 44,
        height: 44,
        [top ? 'top' : 'bottom']: -3,
        [left ? 'left' : 'right']: -3,
        borderColor: COLORS.primary,
        [top ? 'borderTopWidth' : 'borderBottomWidth']: 5,
        [left ? 'borderLeftWidth' : 'borderRightWidth']: 5,
        [`border${top ? 'Top' : 'Bottom'}${left ? 'Left' : 'Right'}Radius`]: FRAME_RADIUS + 3,
      }}
    />
  );
}

export default function ScanScreen() {
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [frame, setFrame] = useState<{ x: number; y: number } | null>(null);
  const [screen, setScreen] = useState<{ width: number; height: number } | null>(null);
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
    Alert.alert('Delete this scan?', 'It will be removed from history.', [
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
        <View className="items-center">
          <View className="w-20 h-20 rounded-3xl bg-primary items-center justify-center mb-6">
            <Camera size={34} color={COLORS.black} strokeWidth={ICON_STROKE} />
          </View>
          <Text
            className="font-display text-[28px] leading-[34px] text-dark text-center mb-2"
            accessibilityRole="header"
          >
            {blocked ? 'Camera is off' : 'Allow the camera'}
          </Text>
          <Text className="text-[16px] leading-[23px] text-muted text-center mb-8 max-w-[300px]">
            {blocked
              ? 'Turn on camera access for QR Toolkit in Settings to scan codes.'
              : 'The camera is only used to read codes. Nothing is recorded or uploaded.'}
          </Text>
          {blocked ? (
            <Button
              title="Open Settings"
              onPress={() => Linking.openSettings()}
              icon={
                <Settings size={18} color={buttonIconColor('primary')} strokeWidth={ICON_STROKE} />
              }
            />
          ) : (
            <Button title="Allow camera" onPress={requestPermission} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-dark">
      {isFocused && <StatusBar style="light" />}
      {isFocused && (
        <CameraView
          style={StyleSheet.absoluteFill}
          enableTorch={torch}
          onBarcodeScanned={result ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />
      )}

      {/* Scrim: full screen minus a rounded window at the frame's measured position. */}
      <View
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
        onLayout={(e) =>
          setScreen({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })
        }
      >
        {frame && screen ? (
          <Svg width={screen.width} height={screen.height}>
            <Path
              fill={SCRIM}
              fillRule="evenodd"
              d={`M0 0H${screen.width}V${screen.height}H0Z ${roundedRectPath(
                frame.x,
                frame.y,
                FRAME_SIZE,
                FRAME_RADIUS
              )}`}
            />
          </Svg>
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: SCRIM }]} />
        )}
      </View>

      {/* Equal flex regions above and below keep the frame centered on the scrim's window. */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <View className="flex-1 justify-end px-6 pb-8" style={{ paddingTop: insets.top }}>
          <Text
            className="font-display text-[30px] leading-[36px] text-white"
            accessibilityRole="header"
          >
            Scan a code
          </Text>
          <Text className="text-[16px] text-white/80 mt-1">
            Fit the code inside the frame. It scans on its own.
          </Text>
        </View>
        <View
          className="self-center"
          style={{ width: FRAME_SIZE, height: FRAME_SIZE }}
          onLayout={(e) => setFrame({ x: e.nativeEvent.layout.x, y: e.nativeEvent.layout.y })}
        >
          <Corner position="tl" />
          <Corner position="tr" />
          <Corner position="bl" />
          <Corner position="br" />
        </View>
        <View className="flex-1 items-center pt-10">
          <Pressable
            onPress={() => setTorch(!torch)}
            accessibilityRole="switch"
            accessibilityLabel="Flashlight"
            accessibilityState={{ checked: torch }}
            className={`flex-row items-center h-12 px-5 rounded-full ${
              torch ? 'bg-primary' : 'bg-white/15'
            }`}
            style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.96 : 1 }] })}
          >
            {torch ? (
              <Flashlight size={19} color={COLORS.black} strokeWidth={ICON_STROKE} />
            ) : (
              <FlashlightOff size={19} color={COLORS.white} strokeWidth={ICON_STROKE} />
            )}
            <Text
              className={`font-body-semibold text-[15px] ml-2 ${torch ? 'text-dark' : 'text-white'}`}
            >
              {torch ? 'Light on' : 'Light off'}
            </Text>
          </Pressable>
        </View>
      </View>

      <BottomSheet
        visible={!!result}
        title="Code found"
        onClose={resetScanner}
        headerRight={result ? <TypeBadge type={result.detected.type} size="sm" /> : undefined}
      >
        <ScrollView
          className="bg-bg rounded-2xl mb-2"
          style={{ maxHeight: 160 }}
          contentContainerStyle={{ padding: 16 }}
        >
          <Text className="font-body-medium text-[16px] leading-[23px] text-dark" selectable>
            {result?.data}
          </Text>
        </ScrollView>
        <Text className="text-sm text-muted mb-5 ml-1">Saved to history</Text>

        {result?.detected.type === 'url' && (
          <View className="mb-3">
            <Button
              title="Open link"
              onPress={handleOpenUrl}
              icon={
                <ExternalLink
                  size={18}
                  color={buttonIconColor('primary')}
                  strokeWidth={ICON_STROKE}
                />
              }
              fullWidth
            />
          </View>
        )}

        <View className="flex-row mb-3">
          <View className="flex-1 mr-2">
            <Button
              title="Copy"
              onPress={() => result && copyText(result.data, showToast)}
              variant={result?.detected.type === 'url' ? 'secondary' : 'primary'}
              icon={
                <Copy
                  size={18}
                  color={buttonIconColor(result?.detected.type === 'url' ? 'secondary' : 'primary')}
                  strokeWidth={ICON_STROKE}
                />
              }
              fullWidth
            />
          </View>
          <View className="flex-1 mr-2">
            <Button
              title="Share"
              onPress={() => result && shareText(result.data)}
              variant="dark"
              icon={<Share2 size={18} color={buttonIconColor('dark')} strokeWidth={ICON_STROKE} />}
              fullWidth
            />
          </View>
          <Pressable
            onPress={handleDelete}
            className="w-14 h-14 rounded-full bg-white border border-danger items-center justify-center"
            accessibilityLabel="Delete from history"
            accessibilityRole="button"
            style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.94 : 1 }] })}
          >
            <Trash2 size={20} color={COLORS.dangerText} strokeWidth={ICON_STROKE} />
          </Pressable>
        </View>

        <Button
          title="Scan another"
          onPress={resetScanner}
          variant="ghost"
          icon={<RefreshCw size={18} color={buttonIconColor('ghost')} strokeWidth={ICON_STROKE} />}
          fullWidth
        />
      </BottomSheet>
    </View>
  );
}
