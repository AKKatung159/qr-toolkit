import { FileText, Globe, Mail, MessageSquare, Phone, Wifi, LucideIcon } from 'lucide-react-native';
import { QRType } from '../types/qr';
import { COLORS } from './theme';

interface QRTypeMeta {
  label: string;
  Icon: LucideIcon;
  /** Pastel tile background. */
  bg: string;
  /** Text/icon color on `bg`; all pass WCAG AA against their pastel. */
  fg: string;
}

export const QR_TYPES: Record<QRType, QRTypeMeta> = {
  text: { label: 'Text', Icon: FileText, bg: COLORS.primaryPastel, fg: '#9A3412' },
  url: { label: 'Website', Icon: Globe, bg: COLORS.pastelBlue, fg: '#1E40AF' },
  wifi: { label: 'WiFi', Icon: Wifi, bg: COLORS.pastelGreen, fg: '#065F46' },
  email: { label: 'Email', Icon: Mail, bg: COLORS.pastelPurple, fg: '#5B21B6' },
  phone: { label: 'Phone', Icon: Phone, bg: COLORS.pastelYellow, fg: '#92400E' },
  sms: { label: 'SMS', Icon: MessageSquare, bg: COLORS.pastelPink, fg: '#9D174D' },
};

/** One stroke width for every icon in the app. */
export const ICON_STROKE = 2;
