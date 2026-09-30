import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, Modal, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { Trash2, Copy, Share2, Download, X } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { HistoryItem } from '../../components/HistoryItem';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SegmentedControl } from '../../components/SegmentedControl';
import { TypeBadge } from '../../components/TypeBadge';
import { useHistory } from '../../hooks/useHistory';
import { QRHistoryItem } from '../../types/qr';
import { COLORS } from '../../constants/theme';

export default function HistoryScreen() {
  const svgRef = useRef<any>(null);
  const router = useRouter();
  const { history, deleteHistoryItem, clearHistory } = useHistory();
  const [filter, setFilter] = useState<'all' | 'scanned' | 'generated'>('all');
  const [selectedItem, setSelectedItem] = useState<QRHistoryItem | null>(null);

  const filteredHistory = history.filter((item) => {
    if (filter === 'scanned') return item.mode === 'scanned';
    if (filter === 'generated') return item.mode === 'generated';
    return true;
  });

  const handleClearAll = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all saved QR history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete All', style: 'destructive', onPress: clearHistory },
      ]
    );
  };

  const getQrImageUri = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!svgRef.current) {
        reject(new Error('QR preview is not available'));
        return;
      }
      svgRef.current.toDataURL(async (data: string) => {
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
  };

  const handleDownloadQr = async () => {
    try {
      const fileUri = await getQrImageUri();
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'image/png',
          dialogTitle: 'Save / Download QR Code',
        });
      } else {
        Alert.alert('Error', 'Sharing/Saving is not supported on this device.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not save QR code image.');
    }
  };

  const handleShareQrImage = async () => {
    try {
      const fileUri = await getQrImageUri();
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'image/png',
          dialogTitle: 'Share QR Code Image',
        });
      } else {
        if (selectedItem) {
          await Share.share({ message: selectedItem.content });
        }
      }
    } catch (error) {
      console.error(error);
      if (selectedItem) {
        await Share.share({ message: selectedItem.content });
      }
    }
  };

  const handleShareText = async (content: string) => {
    try {
      await Share.share({ message: content });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCopy = async (content: string) => {
    await Clipboard.setStringAsync(content);
    Alert.alert('Copied!', 'Content copied to clipboard.');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FFF9F5]">
      <ScreenHeader
        title="History"
        subtitle={`${history.length} items saved locally`}
        rightElement={
          history.length > 0 ? (
            <TouchableOpacity
              onPress={handleClearAll}
              className="p-2 bg-red-50 rounded-full"
              activeOpacity={0.7}
            >
              <Trash2 size={20} color={COLORS.danger} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <View className="px-5 pt-2 flex-1">
        <SegmentedControl
          options={[
            { label: 'All', value: 'all' },
            { label: 'Scanned', value: 'scanned' },
            { label: 'Generated', value: 'generated' },
          ]}
          selectedValue={filter}
          onSelect={setFilter}
        />

        {filteredHistory.length === 0 ? (
          <EmptyState
            title="No History Found"
            description="Scanned and generated QR codes will automatically save here so you can reuse them anytime."
            actionTitle="Scan QR Code"
            onAction={() => router.push('/(tabs)/scan')}
          />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            {filteredHistory.map((item) => (
              <HistoryItem
                key={item.id}
                item={item}
                onPress={() => setSelectedItem(item)}
                onCopy={() => handleCopy(item.content)}
                onShare={() => handleShareText(item.content)}
                onDelete={() => deleteHistoryItem(item.id)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {/* Item Detail Modal */}
      <Modal visible={!!selectedItem} transparent animationType="slide">
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-t-3xl p-6 border-t border-gray-100">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-[#171717]">QR Details</Text>
              <TouchableOpacity
                onPress={() => setSelectedItem(null)}
                className="p-2 rounded-full bg-gray-100"
              >
                <X size={18} color={COLORS.darkGray} />
              </TouchableOpacity>
            </View>

            {selectedItem && (
              <View className="items-center justify-center p-6 bg-[#FFF9F5] rounded-3xl border border-orange-100 mb-4">
                <QRCode
                  getRef={(c) => (svgRef.current = c)}
                  value={selectedItem.content}
                  size={180}
                  color={COLORS.black}
                  backgroundColor="transparent"
                />
                <View className="mt-3 px-3.5 py-1.5 bg-white rounded-full border border-gray-100 items-center justify-center max-w-[90%]">
                  <Text
                    className="text-xs font-semibold text-[#171717] text-center"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {selectedItem.title}
                  </Text>
                </View>
              </View>
            )}

            {selectedItem && (
              <View className="mb-4">
                <TypeBadge type={selectedItem.type} />
                <View className="bg-gray-50 p-4 rounded-2xl mt-2 border border-gray-100">
                  <Text className="text-xs text-gray-500 font-semibold mb-1">Payload:</Text>
                  <Text className="text-sm text-[#171717] font-medium">{selectedItem.content}</Text>
                </View>
              </View>
            )}

            <View className="flex-row space-x-2 mb-3">
              <View className="flex-1 mr-1">
                <Button
                  title="Download"
                  onPress={handleDownloadQr}
                  variant="primary"
                  icon={<Download size={16} color="#FFF" />}
                  fullWidth
                />
              </View>
              <View className="flex-1 mr-1">
                <Button
                  title="Share Image"
                  onPress={handleShareQrImage}
                  variant="dark"
                  icon={<Share2 size={16} color="#FFF" />}
                  fullWidth
                />
              </View>
              <View className="flex-1">
                <Button
                  title="Copy Text"
                  onPress={() => selectedItem && handleCopy(selectedItem.content)}
                  variant="secondary"
                  icon={<Copy size={16} color="#171717" />}
                  fullWidth
                />
              </View>
            </View>

            <Button
              title="Delete Item"
              onPress={async () => {
                if (selectedItem) {
                  await deleteHistoryItem(selectedItem.id);
                  setSelectedItem(null);
                }
              }}
              variant="danger"
              icon={<Trash2 size={18} color="#FFF" />}
              fullWidth
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
