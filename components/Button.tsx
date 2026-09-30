import React from 'react';
import { Pressable, ActivityIndicator, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'dark' | 'danger' | 'ghost';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
}

// Orange carries dark text: white on #FF8A3D is ~2.4:1 and fails WCAG AA.
const CONTAINER: Record<Variant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-primary-pastel',
  dark: 'bg-dark',
  danger: 'bg-white border border-danger',
  ghost: 'bg-transparent',
};

const TEXT_COLOR: Record<Variant, string> = {
  primary: COLORS.black,
  secondary: COLORS.black,
  dark: COLORS.white,
  danger: COLORS.dangerText,
  ghost: COLORS.black,
};

const SIZE = {
  sm: { container: 'h-11 px-4', font: 15 },
  md: { container: 'h-14 px-6', font: 16 },
  lg: { container: 'h-16 px-8', font: 18 },
};

/** Icon color that matches a button variant's label. */
export function buttonIconColor(variant: Variant = 'primary'): string {
  return TEXT_COLOR[variant];
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
  accessibilityLabel,
}) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={`flex-row items-center justify-center rounded-full ${CONTAINER[variant]} ${
        SIZE[size].container
      } ${fullWidth ? 'w-full' : ''}`}
      style={({ pressed }) => ({
        opacity: isDisabled ? 0.5 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      {loading ? (
        <ActivityIndicator color={TEXT_COLOR[variant]} />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && <View className="mr-2">{icon}</View>}
          <Text
            className="font-body-semibold"
            numberOfLines={1}
            style={{ color: TEXT_COLOR[variant], fontSize: SIZE[size].font }}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
};
