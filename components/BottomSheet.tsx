import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { ICON_STROKE } from '../constants/qrTypes';
import { Text } from './Text';
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
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(23,23,23,0.45)' }}>
        <Pressable
          className="absolute inset-0"
          onPress={onClose}
          accessibilityLabel="Close"
          accessibilityRole="button"
        />
        <View
          className="bg-white rounded-t-3xl px-5 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
        >
          <View className="w-10 h-1 rounded-full bg-line self-center mb-4" />
          <View className="flex-row items-center justify-between mb-5">
            <View className="flex-row items-center flex-1 pr-3">
              <Text className="font-title text-xl text-dark mr-3" accessibilityRole="header">
                {title}
              </Text>
              {headerRight}
            </View>
            <Pressable
              onPress={onClose}
              className="w-11 h-11 rounded-full bg-bg items-center justify-center"
              accessibilityLabel="Close"
              accessibilityRole="button"
              style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.94 : 1 }] })}
            >
              <X size={20} color={COLORS.black} strokeWidth={ICON_STROKE} />
            </Pressable>
          </View>
          {children}
        </View>
        <ToastHost bottomOffset={Math.max(insets.bottom, 16) + 24} />
      </View>
    </Modal>
  );
};
