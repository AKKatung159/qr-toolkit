import React from 'react';
import { View, Text } from 'react-native';
import { Button } from './Button';
import { QrCode } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

interface EmptyStateProps {
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionTitle,
  onAction,
  icon,
}) => {
  return (
    <View className="flex-1 items-center justify-center p-8 text-center my-12">
      <View className="w-20 h-20 rounded-full bg-[#FFEBDD] items-center justify-center mb-4">
        {icon || <QrCode size={36} color={COLORS.primary} />}
      </View>
      <Text className="text-xl font-bold text-[#171717] mb-2 text-center">{title}</Text>
      <Text className="text-sm text-gray-500 text-center mb-6 leading-relaxed">{description}</Text>
      {actionTitle && onAction && (
        <Button title={actionTitle} onPress={onAction} variant="primary" size="md" />
      )}
    </View>
  );
};
