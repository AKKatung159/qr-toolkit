import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { QRHistoryItem } from '../types/qr';
import { TypeBadge } from './TypeBadge';
import { Copy, Share2, Trash2, ArrowUpRight } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

interface HistoryItemProps {
  item: QRHistoryItem;
  onPress: () => void;
  onCopy?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({
  item,
  onPress,
  onCopy,
  onShare,
  onDelete,
}) => {
  const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white p-4 rounded-2xl mb-3 border border-gray-100"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center space-x-2">
          <TypeBadge type={item.type} size="sm" />
          <View
            className={`px-2 py-0.5 rounded-md ${
              item.mode === 'scanned' ? 'bg-blue-50' : 'bg-orange-50'
            }`}
          >
            <Text
              className="text-[10px] font-bold uppercase tracking-wider ml-1"
              style={{ color: item.mode === 'scanned' ? '#2563EB' : COLORS.primary }}
            >
              {item.mode}
            </Text>
          </View>
        </View>
        <Text className="text-xs text-gray-400 font-medium">{formattedDate}</Text>
      </View>

      <Text className="font-bold text-base text-[#171717] mb-1" numberOfLines={1}>
        {item.title}
      </Text>

      <Text className="text-xs text-gray-500 mb-3" numberOfLines={2}>
        {item.content}
      </Text>

      <View className="flex-row items-center justify-between pt-2 border-t border-gray-50">
        <View className="flex-row items-center space-x-4">
          {onCopy && (
            <TouchableOpacity onPress={onCopy} className="p-1 mr-3">
              <Copy size={16} color={COLORS.gray} />
            </TouchableOpacity>
          )}
          {onShare && (
            <TouchableOpacity onPress={onShare} className="p-1 mr-3">
              <Share2 size={16} color={COLORS.gray} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} className="p-1">
              <Trash2 size={16} color={COLORS.danger} />
            </TouchableOpacity>
          )}
        </View>
        <ArrowUpRight size={16} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );
};
