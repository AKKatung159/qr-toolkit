import React from 'react';
import { View, Text } from 'react-native';
import { QRType } from '../types/qr';
import { Globe, FileText, Wifi, Mail, Phone } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

interface TypeBadgeProps {
  type: QRType;
  size?: 'sm' | 'md';
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type, size = 'md' }) => {
  const getConfig = () => {
    switch (type) {
      case 'url':
        return {
          label: 'Website',
          bg: COLORS.pastelBlue,
          color: '#1E40AF',
          Icon: Globe,
        };
      case 'wifi':
        return {
          label: 'WiFi',
          bg: COLORS.pastelGreen,
          color: '#065F46',
          Icon: Wifi,
        };
      case 'email':
        return {
          label: 'Email',
          bg: COLORS.pastelPurple,
          color: '#5B21B6',
          Icon: Mail,
        };
      case 'phone':
        return {
          label: 'Phone',
          bg: COLORS.pastelYellow,
          color: '#92400E',
          Icon: Phone,
        };
      case 'text':
      default:
        return {
          label: 'Text',
          bg: COLORS.primaryPastel,
          color: '#9A3412',
          Icon: FileText,
        };
    }
  };

  const config = getConfig();
  const IconComponent = config.Icon;
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <View
      className="flex-row items-center rounded-full px-2.5 py-1"
      style={{ backgroundColor: config.bg }}
    >
      <IconComponent size={iconSize} color={config.color} />
      <Text
        className="font-semibold ml-1.5 capitalize"
        style={{ color: config.color, fontSize: size === 'sm' ? 11 : 12 }}
      >
        {config.label}
      </Text>
    </View>
  );
};
