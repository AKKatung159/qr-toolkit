import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  rightElement,
}) => {
  const router = useRouter();

  return (
    <View className="px-5 pt-4 pb-3 flex-row items-center justify-between bg-[#FFF9F5]">
      <View className="flex-row items-center flex-1 pr-2">
        {showBack && (
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 p-2 bg-white rounded-full border border-gray-100"
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={COLORS.black} />
          </TouchableOpacity>
        )}
        <View className="flex-1">
          <Text className="text-2xl font-black text-[#171717] tracking-tight">{title}</Text>
          {subtitle && <Text className="text-xs text-gray-500 font-medium mt-0.5">{subtitle}</Text>}
        </View>
      </View>
      {rightElement && <View>{rightElement}</View>}
    </View>
  );
};
