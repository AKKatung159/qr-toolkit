export type QRType = 'text' | 'url' | 'wifi' | 'email' | 'phone' | 'sms';
export type QRMode = 'scanned' | 'generated';
export type WiFiSecurity = 'WPA' | 'WEP' | 'nopass';

export interface WiFiContent {
  ssid: string;
  password?: string;
  security?: WiFiSecurity;
  hidden?: boolean;
}

export interface EmailContent {
  email: string;
  subject?: string;
  body?: string;
}

export interface SMSContent {
  phone: string;
  message?: string;
}

export interface QRMetadata {
  wifi?: WiFiContent;
  email?: EmailContent;
  sms?: SMSContent;
  phone?: string;
}

export interface QRHistoryItem {
  id: string;
  type: QRType;
  content: string;
  title: string;
  mode: QRMode;
  createdAt: string;
  metadata?: QRMetadata;
}
