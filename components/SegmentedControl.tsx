import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SegmentedControlProps<T extends string> {
  options: { label: string; value: T }[];
  selectedValue: T;
  onSelect: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  selectedValue,
  onSelect,
}: SegmentedControlProps<T>) {
  return (
    <View
      className="flex-row p-1 rounded-2xl mb-4"
      style={{ backgroundColor: 'rgba(229,231,235,0.7)' }}
    >
      {options.map((opt) => {
        const isSelected = opt.value === selectedValue;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            className={`flex-1 py-2.5 rounded-xl items-center justify-center ${
              isSelected ? 'bg-white' : ''
            }`}
            style={
              isSelected
                ? {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }
                : undefined
            }
          >
            <Text className={`text-xs font-bold ${isSelected ? 'text-dark' : 'text-gray-500'}`}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
