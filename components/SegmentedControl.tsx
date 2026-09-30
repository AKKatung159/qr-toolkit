import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from './Text';

interface SegmentedControlProps<T extends string> {
  options: { label: string; value: T }[];
  selectedValue: T;
  onSelect: (value: T) => void;
}

/** Row of pill chips; the selected one is filled dark so it doesn't rely on color alone. */
export function SegmentedControl<T extends string>({
  options,
  selectedValue,
  onSelect,
}: SegmentedControlProps<T>) {
  return (
    <View className="flex-row mb-5" accessibilityRole="tablist">
      {options.map((opt) => {
        const isSelected = opt.value === selectedValue;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            className={`h-10 px-4 mr-2 rounded-full items-center justify-center ${
              isSelected ? 'bg-dark' : 'bg-white border border-line'
            }`}
            style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.96 : 1 }] })}
          >
            <Text
              className={`font-body-semibold text-sm ${isSelected ? 'text-white' : 'text-dark'}`}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
