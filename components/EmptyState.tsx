import React from 'react';
import { View } from 'react-native';
import { QrCode } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { ICON_STROKE } from '../constants/qrTypes';
import { Button } from './Button';
import { Text } from './Text';

interface EmptyStateProps {
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionTitle,
  onAction,
  compact = false,
}) => (
  <View className={`items-center px-8 ${compact ? 'py-8' : 'flex-1 justify-center pb-16'}`}>
    <View className="w-16 h-16 rounded-2xl bg-primary-pastel items-center justify-center mb-4">
      <QrCode size={30} color={COLORS.black} strokeWidth={ICON_STROKE} />
    </View>
    <Text className="font-title text-xl text-dark text-center mb-1.5">{title}</Text>
    <Text className="text-[15px] leading-[22px] text-muted text-center mb-6 max-w-[280px]">
      {description}
    </Text>
    {actionTitle && onAction && <Button title={actionTitle} onPress={onAction} size="sm" />}
  </View>
);
