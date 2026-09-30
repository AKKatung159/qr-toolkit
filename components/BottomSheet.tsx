import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { ToastHost } from './Toast';

interface BottomSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  title,
  onClose,
  headerRight,
  children,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <Pressable
          className="absolute inset-0"
          onPress={onClose}
          accessibilityLabel="Close"
          accessibilityRole="button"
        />
        <View
          className="bg-white rounded-t-3xl px-6 pt-6 border-t border-gray-100"
          style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-dark" accessibilityRole="header">
              {title}
            </Text>
            <View className="flex-row items-center">
              {headerRight}
              <TouchableOpacity
                onPress={onClose}
                className="w-10 h-10 ml-2 rounded-full bg-gray-100 items-center justify-center"
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <X size={18} color={COLORS.darkGray} />
              </TouchableOpacity>
            </View>
          </View>
          {children}
        </View>
        <ToastHost bottomOffset={Math.max(insets.bottom, 16) + 24} />
      </View>
    </Modal>
  );
};
