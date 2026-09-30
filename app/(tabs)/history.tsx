import React, { useMemo, useRef, useState } from 'react';
import { View, Text, Alert, TouchableOpacity, SectionList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { Trash2, Copy, Share2 } from 'lucide-react-native';

import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { HistoryItem } from '../../components/HistoryItem';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SegmentedControl } from '../../components/SegmentedControl';
import { TypeBadge } from '../../components/TypeBadge';
import { useToast } from '../../components/Toast';
import { useHistory } from '../../hooks/useHistory';
import { useHistoryActions } from '../../hooks/useHistoryActions';
import { QRCodeRef, shareQrImage } from '../../services/share';
import { QRHistoryItem, QRMode } from '../../types/qr';
import { COLORS } from '../../constants/theme';

type Filter = 'all' | QRMode;

function sectionTitle(date: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function groupByDay(items: QRHistoryItem[]) {
  const sections: { title: string; data: QRHistoryItem[] }[] = [];
  for (const item of items) {
    const title = sectionTitle(new Date(item.createdAt));
    const last = sections[sections.length - 1];
    if (last && last.title === title) last.data.push(item);
    else sections.push({ title, data: [item] });
  }
  return sections;
}

export default function HistoryScreen() {
  const qrRef = useRef<QRCodeRef | null>(null);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { history, clearHistory } = useHistory();
  const { copy, share, confirmDelete } = useHistoryActions();
  const showToast = useToast();
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedItem, setSelectedItem] = useState<QRHistoryItem | null>(null);

  // Home's "Recent" list opens an item via /history?id=...
  const detailItem = selectedItem ?? history.find((entry) => entry.id === id) ?? null;

  const closeDetail = () => {
    setSelectedItem(null);
    if (id) router.setParams({ id: undefined });
  };

  const sections = useMemo(
    () => groupByDay(filter === 'all' ? history : history.filter((item) => item.mode === filter)),
    [history, filter]
  );

  const handleClearAll = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all saved QR history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            showToast('History cleared');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <ScreenHeader
        title="History"
        subtitle={`${history.length} ${history.length === 1 ? 'item' : 'items'} saved locally`}
        rightElement={
          history.length > 0 ? (
            <TouchableOpacity
              onPress={handleClearAll}
              className="w-11 h-11 bg-red-50 rounded-full items-center justify-center"
              activeOpacity={0.7}
              accessibilityLabel="Clear all history"
              accessibilityRole="button"
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

        {sections.length === 0 ? (
          <EmptyState
            title={history.length === 0 ? 'No QR codes yet' : `No ${filter} QR codes`}
            description="Scan or generate your first QR code and it will appear here."
            actionTitle="Scan QR Code"
            onAction={() => router.push('/(tabs)/scan')}
          />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            renderSectionHeader={({ section }) => (
              <Text
                className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-1"
                accessibilityRole="header"
              >
                {section.title}
              </Text>
            )}
            renderItem={({ item }) => (
              <HistoryItem
                item={item}
                onPress={() => setSelectedItem(item)}
                onCopy={() => copy(item.content)}
                onShare={() => share(item.content)}
                onDelete={() => confirmDelete(item)}
              />
            )}
          />
        )}
      </View>

      {/* Item Detail Sheet */}
      <BottomSheet
        visible={!!detailItem}
        title="QR Details"
        onClose={closeDetail}
        headerRight={detailItem ? <TypeBadge type={detailItem.type} /> : undefined}
      >
        {detailItem && (
          <>
            <View className="items-center justify-center p-5 bg-bg rounded-3xl border border-orange-100 mb-4">
              <QRCode
                getRef={(c: QRCodeRef | null) => (qrRef.current = c)}
                value={detailItem.content}
                size={180}
                color={COLORS.black}
                backgroundColor={COLORS.white}
                quietZone={8}
              />
              <View className="mt-3 px-3.5 py-1.5 bg-white rounded-full border border-gray-100 items-center justify-center max-w-[90%]">
                <Text
                  className="text-xs font-semibold text-dark text-center"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {detailItem.title}
                </Text>
              </View>
            </View>

            <ScrollView
              className="bg-gray-50 rounded-2xl mb-4 border border-gray-100"
              style={{ maxHeight: 120 }}
              contentContainerStyle={{ padding: 16 }}
            >
              <Text className="text-xs text-gray-500 font-semibold mb-1">Content</Text>
              <Text className="text-sm text-dark font-medium" selectable>
                {detailItem.content}
              </Text>
            </ScrollView>

            <View className="flex-row mb-3">
              <View className="flex-1 mr-2">
                <Button
                  title="Share QR"
                  onPress={() => shareQrImage(qrRef.current, detailItem.content, 'Share QR Code')}
                  variant="primary"
                  size="sm"
                  icon={<Share2 size={16} color={COLORS.white} />}
                  fullWidth
                />
              </View>
              <View className="flex-1">
                <Button
                  title="Copy"
                  onPress={() => copy(detailItem.content)}
                  variant="secondary"
                  size="sm"
                  icon={<Copy size={16} color={COLORS.black} />}
                  fullWidth
                />
              </View>
            </View>

            <Button
              title="Delete Item"
              onPress={() => confirmDelete(detailItem, closeDetail)}
              variant="danger"
              icon={<Trash2 size={18} color={COLORS.white} />}
              fullWidth
            />
          </>
        )}
      </BottomSheet>
    </SafeAreaView>
  );
}
