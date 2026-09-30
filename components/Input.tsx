import React, { useState } from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { COLORS } from '../constants/theme';
import { Text } from './Text';

interface InputProps extends TextInputProps {
  label: string;
  hint?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  hint,
  error,
  multiline,
  onFocus,
  onBlur,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? COLORS.dangerText : focused ? COLORS.black : COLORS.line;

  return (
    <View className="mb-5 w-full">
      <Text className="font-body-semibold text-sm text-dark mb-2">{label}</Text>
      <TextInput
        placeholderTextColor={COLORS.gray}
        className="font-body text-base text-dark bg-bg rounded-2xl px-4"
        style={{
          borderWidth: 1.5,
          borderColor,
          minHeight: multiline ? 104 : 52,
          paddingTop: multiline ? 14 : 0,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
        {...props}
        multiline={multiline}
        accessibilityLabel={label}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
      />
      {error ? (
        <Text className="text-sm text-danger-text mt-1.5">{error}</Text>
      ) : hint ? (
        <Text className="text-sm text-muted mt-1.5">{hint}</Text>
      ) : null}
    </View>
  );
};
