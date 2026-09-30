import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { COLORS } from '../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  className = '',
  ...props
}) => {
  return (
    <View className="mb-4 w-full">
      {label && <Text className="text-sm font-semibold text-dark mb-1.5 ml-1">{label}</Text>}
      <View
        className={`flex-row items-center border rounded-2xl px-4 py-3.5 bg-white ${
          error ? 'border-red-500' : 'border-gray-200 focus:border-primary'
        } ${className}`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.03,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}
        <TextInput
          placeholderTextColor={COLORS.gray}
          className="flex-1 text-base text-dark"
          {...props}
        />
      </View>
      {error && <Text className="text-xs text-red-500 mt-1 ml-1">{error}</Text>}
    </View>
  );
};
