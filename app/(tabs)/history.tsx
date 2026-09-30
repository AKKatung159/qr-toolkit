import React, { useMemo, useRef, useState } from 'react';
import { View, Alert, Pressable, SectionList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Trash2, Copy, Share2 } from 'lucide-react-native';

import { BottomSheet } from '../../components/BottomSheet';
import { Button, buttonIconColor } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { HistoryGroup, HistoryItem } from '../../components/HistoryItem';
import { QRCard } from '../../components/QRCard';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SegmentedControl } from '../../components/SegmentedControl';
import { Text } from '../../components/Text';
import { TypeBadge } from '../../components/TypeBadge';
import { useToast } from '../../components/Toast';
import { useHistory } from '../../hooks/useHistory';
import { useHistoryActions } from '../../hooks/useHistoryActions';
import { QRCodeRef, shareQrImage } from '../../services/share';
import { QRHistoryItem, QRMode } from '../../types/qr';
import { COLORS } from '../../constants/theme';
import { ICON_STROKE } from '../../constants/qrTypes';

type Filter = 'all' | QRMode;

function sectionTitle(date: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

/** Groups items by day; each section holds a single entry (the day's items) so it renders as one surface. */
function groupByDay(items: QRHistoryItem[]) {
  const sections: { title: string; data: QRHistoryItem[][] }[] = [];
  for (const item of items) {
    const title = sectionTitle(new Date(item.createdAt));
    const last = sections[sections.length - 1];
    if (last && last.title === title) last.data[0].push(item);
    else sections.push({ title, data: [[item]] });
  }
  return sections;
}

export default function HistoryScreen() {
  const qrRef = useRef<QRCodeRef | null>(null);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { history, clearHistory } = useHistory();
  const { copy, confirmDelete } = useHistoryActions();
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
    Alert.alert('Clear history?', 'All saved codes will be deleted. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete all',
        style: 'destructive',
        onPress: async () => {
          await clearHistory();
          showToast('History cleared');
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <ScreenHeader
        title="History"
        subtitle={
          history.length === 0
            ? 'Saved on this phone only'
            : `${history.length} ${history.length === 1 ? 'code' : 'codes'}, saved on this phone`
        }
        rightElement={
          history.length > 0 ? (
            <Pressable
              onPress={handleClearAll}
              className="w-11 h-11 bg-white border border-line rounded-full items-center justify-center"
              accessibilityLabel="Clear all history"
              accessibilityRole="button"
              style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.94 : 1 }] })}
            >
              <Trash2 size={19} color={COLORS.dangerText} strokeWidth={ICON_STROKE} />
            </Pressable>
          ) : undefined
        }
      />

      <View className="px-5 flex-1">
        <SegmentedControl
          options={[
            { label: 'All', value: 'all' },
            { label: 'Scanned', value: 'scanned' },
            { label: 'Created', value: 'generated' },
          ]}
          selectedValue={filter}
          onSelect={setFilter}
        />

        {sections.length === 0 ? (
          <EmptyState
            title={history.length === 0 ? 'Nothing here yet' : 'No codes in this filter'}
            description="Codes you scan or create will show up here."
            actionTitle={history.length === 0 ? 'Scan a code' : undefined}
            onAction={() => router.push('/(tabs)/scan')}
          />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(group) => group[0].id}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={{ paddingBottom: 16 }}
            renderSectionHeader={({ section }) => (
              <Text
                className="font-body-semibold text-[15px] text-muted mb-2 ml-1"
                accessibilityRole="header"
              >
                {section.title}
              </Text>
            )}
            renderItem={({ item: group }) => (
              <HistoryGroup>
                {group.map((item) => (
                  <HistoryItem key={item.id} item={item} onPress={() => setSelectedItem(item)} />
                ))}
              </HistoryGroup>
            )}
          />
        )}
      </View>

      <BottomSheet
        visible={!!detailItem}
        title={detailItem?.mode === 'scanned' ? 'Scanned code' : 'Created code'}
        onClose={closeDetail}
        headerRight={detailItem ? <TypeBadge type={detailItem.type} size="sm" /> : undefined}
      >
        {detailItem && (
          <>
            <QRCard
              value={detailItem.content}
              caption={detailItem.title}
              size={176}
              qrRef={qrRef}
            />

            <ScrollView
              className="bg-bg rounded-2xl mb-5"
              style={{ maxHeight: 96 }}
              contentContainerStyle={{ padding: 14 }}
            >
              <Text className="text-[15px] leading-[21px] text-dark" selectable>
                {detailItem.content}
              </Text>
            </ScrollView>

            <View className="flex-row mb-3">
              <View className="flex-1 mr-2">
                <Button
                  title="Share"
                  onPress={() => shareQrImage(qrRef.current, detailItem.content, 'Share QR Code')}
                  variant="primary"
                  icon={
                    <Share2
                      size={18}
                      color={buttonIconColor('primary')}
                      strokeWidth={ICON_STROKE}
                    />
                  }
                  fullWidth
                />
              </View>
              <View className="flex-1">
                <Button
                  title="Copy"
                  onPress={() => copy(detailItem.content)}
                  variant="secondary"
                  icon={
                    <Copy
                      size={18}
                      color={buttonIconColor('secondary')}
                      strokeWidth={ICON_STROKE}
                    />
                  }
                  fullWidth
                />
              </View>
            </View>

            <Button
              title="Delete from history"
              onPress={() => confirmDelete(detailItem, closeDetail)}
              variant="danger"
              icon={
                <Trash2 size={18} color={buttonIconColor('danger')} strokeWidth={ICON_STROKE} />
              }
              fullWidth
            />
          </>
        )}
      </BottomSheet>
    </SafeAreaView>
  );
}
