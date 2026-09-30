import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { COLORS } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'dark' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
}) => {
  const getContainerVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#FF8A3D] active:bg-[#e0752d]';
      case 'secondary':
        return 'bg-[#FFEBDD] active:bg-[#ffd8bd]';
      case 'dark':
        return 'bg-[#171717] active:bg-[#2A2A2A]';
      case 'danger':
        return 'bg-[#FF6B6B] active:bg-[#e05353]';
      case 'ghost':
        return 'bg-transparent active:bg-gray-100';
      default:
        return 'bg-[#FF8A3D]';
    }
  };

  const getTextColor = () => {
    if (variant === 'secondary' || variant === 'ghost') return COLORS.black;
    return COLORS.white;
  };

  const getContainerSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 rounded-full';
      case 'lg':
        return 'px-8 py-4 rounded-2xl';
      case 'md':
      default:
        return 'px-6 py-3.5 rounded-xl';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      className={`flex-row items-center justify-center ${getContainerVariantStyles()} ${getContainerSizeStyles()} ${fullWidth ? 'w-full' : ''}`}
      style={{
        opacity: disabled ? 0.5 : 1,
        shadowColor: variant === 'primary' ? COLORS.primary : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: variant === 'primary' ? 0.25 : 0.05,
        shadowRadius: 4,
        elevation: variant === 'primary' ? 3 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && <View className="mr-2">{icon}</View>}
          <Text
            className="font-bold text-center"
            style={{
              color: getTextColor(),
              fontSize: size === 'lg' ? 18 : size === 'sm' ? 14 : 16,
            }}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
