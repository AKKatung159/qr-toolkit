import React from 'react';
import { Pressable, View } from 'react-native';
import { ScanLine, Sparkles } from 'lucide-react-native';
import { QRHistoryItem } from '../types/qr';
import { COLORS, SHADOW } from '../constants/theme';
import { ICON_STROKE } from '../constants/qrTypes';
import { Text } from './Text';
import { TypeIcon } from './TypeBadge';

function formatTime(iso: string): string {
  const date = new Date(iso);
  const isToday = date.toDateString() === new Date().toDateString();
  return date.toLocaleString(undefined, {
    ...(isToday ? {} : { month: 'short', day: 'numeric' }),
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface HistoryItemProps {
  item: QRHistoryItem;
  onPress: () => void;
}

/** One row inside a <HistoryGroup>. Copy, share and delete live in the detail sheet. */
export const HistoryItem: React.FC<HistoryItemProps> = ({ item, onPress }) => {
  const time = formatTime(item.createdAt);
  const isScanned = item.mode === 'scanned';
  const ModeIcon = isScanned ? ScanLine : Sparkles;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.mode} ${time}. Open details`}
      className="flex-row items-center px-4 py-3.5"
      style={({ pressed }) => ({ backgroundColor: pressed ? COLORS.background : 'transparent' })}
    >
      <TypeIcon type={item.type} />
      <View className="flex-1 ml-3.5">
        <Text className="font-body-semibold text-base text-dark" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="text-sm text-muted mt-0.5" numberOfLines={1}>
          {item.content}
        </Text>
      </View>
      <View className="items-end ml-3">
        <Text className="text-xs text-muted">{time}</Text>
        <View className="flex-row items-center mt-1">
          <ModeIcon size={12} color={COLORS.gray} strokeWidth={ICON_STROKE} />
          <Text className="text-xs text-muted ml-1">{isScanned ? 'Scanned' : 'Created'}</Text>
        </View>
      </View>
    </Pressable>
  );
};

/** White rounded surface that groups rows with hairline dividers. */
export const HistoryGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const rows = React.Children.toArray(children);
  return (
    <View className="bg-white rounded-3xl overflow-hidden mb-6" style={{ boxShadow: SHADOW.soft }}>
      {rows.map((row, i) => (
        <View key={i}>
          {i > 0 && <View className="h-px bg-line ml-[74px]" />}
          {row}
        </View>
      ))}
    </View>
  );
};
