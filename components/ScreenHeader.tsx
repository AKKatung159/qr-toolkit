import React from 'react';
import { View } from 'react-native';
import { Text } from './Text';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, subtitle, rightElement }) => (
  <View className="px-5 pt-3 pb-4 flex-row items-end justify-between">
    <View className="flex-1 pr-3">
      <Text
        className="font-display text-[32px] leading-[38px] text-dark"
        accessibilityRole="header"
      >
        {title}
      </Text>
      {subtitle && <Text className="text-[15px] leading-[21px] text-muted mt-1">{subtitle}</Text>}
    </View>
    {rightElement}
  </View>
);
