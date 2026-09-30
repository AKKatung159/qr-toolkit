export type QRType = 'text' | 'url' | 'wifi' | 'email' | 'phone';
export type QRMode = 'scanned' | 'generated';

export interface WiFiContent {
  ssid: string;
  password?: string;
  security?: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}

export interface EmailContent {
  email: string;
  subject?: string;
  body?: string;
}

export interface QRHistoryItem {
  id: string;
  type: QRType;
  content: string;
  title: string;
  mode: QRMode;
  createdAt: string;
  metadata?: {
    wifi?: WiFiContent;
    email?: EmailContent;
    phone?: string;
  };
}
