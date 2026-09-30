import React from 'react';
import { View } from 'react-native';
import { QRType } from '../types/qr';
import { ICON_STROKE, QR_TYPES } from '../constants/qrTypes';
import { Text } from './Text';

interface TypeBadgeProps {
  type: QRType;
  size?: 'sm' | 'md';
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type, size = 'md' }) => {
  const { label, Icon, bg, fg } = QR_TYPES[type];

  return (
    <View
      className="flex-row items-center self-start rounded-full px-3 py-1"
      style={{ backgroundColor: bg }}
    >
      <Icon size={size === 'sm' ? 12 : 14} color={fg} strokeWidth={ICON_STROKE} />
      <Text
        className="font-body-semibold ml-1.5"
        style={{ color: fg, fontSize: size === 'sm' ? 12 : 13 }}
      >
        {label}
      </Text>
    </View>
  );
};

/** Square pastel tile with the type's icon, used as the leading element of list rows. */
export const TypeIcon: React.FC<{ type: QRType; size?: number }> = ({ type, size = 44 }) => {
  const { Icon, bg, fg } = QR_TYPES[type];

  return (
    <View
      className="rounded-2xl items-center justify-center"
      style={{ width: size, height: size, backgroundColor: bg }}
    >
      <Icon size={size * 0.45} color={fg} strokeWidth={ICON_STROKE} />
    </View>
  );
};
