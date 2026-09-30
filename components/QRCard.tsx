import React from 'react';
import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { COLORS } from '../constants/theme';
import { QRCodeRef } from '../services/share';
import { Text } from './Text';

interface QRCardProps {
  value: string;
  caption: string;
  color?: string;
  size?: number;
  qrRef?: React.RefObject<QRCodeRef | null>;
}

/** QR code on a white quiet zone inside a pastel frame, with a one-line caption. */
export const QRCard: React.FC<QRCardProps> = ({
  value,
  caption,
  color = COLORS.black,
  size = 200,
  qrRef,
}) => (
  <View className="items-center bg-primary-pastel rounded-3xl pt-6 pb-4 px-4 mb-4">
    <View className="bg-white rounded-2xl p-3">
      <QRCode
        getRef={(c: QRCodeRef | null) => {
          if (qrRef) qrRef.current = c;
        }}
        value={value}
        size={size}
        color={color}
        backgroundColor={COLORS.white}
        quietZone={6}
      />
    </View>
    <Text
      className="font-body-semibold text-[15px] text-dark text-center mt-3 max-w-[90%]"
      numberOfLines={1}
    >
      {caption}
    </Text>
  </View>
);
