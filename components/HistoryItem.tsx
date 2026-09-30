import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { QRHistoryItem } from '../types/qr';
import { TypeBadge } from './TypeBadge';
import { Copy, Share2, Trash2, ArrowUpRight, ScanLine, Sparkles } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

interface HistoryItemProps {
  item: QRHistoryItem;
  onPress: () => void;
  onCopy?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
}

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  children: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, onPress, children }) => (
  <TouchableOpacity
    onPress={onPress}
    className="w-11 h-11 items-center justify-center rounded-full mr-1"
    accessibilityLabel={label}
    accessibilityRole="button"
    hitSlop={4}
  >
    {children}
  </TouchableOpacity>
);

export const HistoryItem: React.FC<HistoryItemProps> = ({
  item,
  onPress,
  onCopy,
  onShare,
  onDelete,
}) => {
  const createdAt = new Date(item.createdAt);
  const isToday = createdAt.toDateString() === new Date().toDateString();
  const formattedTime = createdAt.toLocaleString(undefined, {
    ...(isToday ? {} : { month: 'short', day: 'numeric' }),
    hour: '2-digit',
    minute: '2-digit',
  });
  const isScanned = item.mode === 'scanned';
  const ModeIcon = isScanned ? ScanLine : Sparkles;
  const modeColor = isScanned ? '#2563EB' : '#C2410C';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.mode} at ${formattedTime}. Open details`}
      className="bg-white px-4 pt-4 pb-1 rounded-2xl mb-3 border border-gray-100"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <TypeBadge type={item.type} size="sm" />
          <View
            className={`flex-row items-center px-2 py-1 rounded-full ml-2 ${
              isScanned ? 'bg-blue-50' : 'bg-orange-50'
            }`}
          >
            <ModeIcon size={11} color={modeColor} />
            <Text
              className="text-[10px] font-bold uppercase tracking-wider ml-1"
              style={{ color: modeColor }}
            >
              {item.mode}
            </Text>
          </View>
        </View>
        <Text className="text-xs text-gray-500 font-medium">{formattedTime}</Text>
      </View>

      <Text className="font-bold text-base text-dark mb-1" numberOfLines={1}>
        {item.title}
      </Text>

      <Text className="text-xs text-gray-500 mb-2" numberOfLines={2}>
        {item.content}
      </Text>

      <View className="flex-row items-center justify-between border-t border-gray-50">
        <View className="flex-row items-center -ml-3">
          {onCopy && (
            <ActionButton label="Copy content" onPress={onCopy}>
              <Copy size={18} color={COLORS.gray} />
            </ActionButton>
          )}
          {onShare && (
            <ActionButton label="Share content" onPress={onShare}>
              <Share2 size={18} color={COLORS.gray} />
            </ActionButton>
          )}
          {onDelete && (
            <ActionButton label="Delete from history" onPress={onDelete}>
              <Trash2 size={18} color={COLORS.danger} />
            </ActionButton>
          )}
        </View>
        <ArrowUpRight size={18} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );
};
