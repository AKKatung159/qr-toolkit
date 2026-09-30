import { QRType, QRMetadata, WiFiContent, WiFiSecurity, EmailContent } from '../types/qr';

export interface DetectedQR {
  type: QRType;
  title: string;
  metadata?: QRMetadata;
}

// Characters that must be backslash-escaped inside WIFI: payload fields.
const WIFI_SPECIAL_CHARS = /([\\;,:"])/g;

function escapeWiFiValue(value: string): string {
  return value.replace(WIFI_SPECIAL_CHARS, '\\$1');
}

/** Reads WIFI:K:value; fields, honouring backslash escapes. */
function parseWiFiFields(payload: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const body = payload.slice('WIFI:'.length);
  let key = '';
  let value = '';
  let readingKey = true;

  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (readingKey) {
      if (ch === ':') readingKey = false;
      else if (ch !== ';') key += ch;
      continue;
    }
    if (ch === '\\' && i + 1 < body.length) {
      value += body[++i];
    } else if (ch === ';') {
      if (key) fields[key.toUpperCase()] = value;
      key = '';
      value = '';
      readingKey = true;
    } else {
      value += ch;
    }
  }
  if (!readingKey && key) fields[key.toUpperCase()] = value;
  return fields;
}

function toWiFiSecurity(value: string | undefined): WiFiSecurity {
  if (!value) return 'nopass';
  const upper = value.toUpperCase();
  if (upper === 'WEP') return 'WEP';
  if (upper === 'NOPASS' || upper === 'NONE') return 'nopass';
  return 'WPA';
}

export function detectQRType(content: string): DetectedQR {
  const trimmed = content.trim();

  // URL check
  if (
    /^(https?:\/\/|www\.)[^\s]+$/i.test(trimmed) ||
    /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?$/i.test(trimmed)
  ) {
    let url = trimmed;
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    return {
      type: 'url',
      title: url,
    };
  }

  // WiFi check (WIFI:S:SSID;T:WPA;P:PASSWORD;;)
  if (/^WIFI:/i.test(trimmed)) {
    const fields = parseWiFiFields(trimmed);
    const ssid = fields.S || 'WiFi Network';
    const wifiData: WiFiContent = {
      ssid,
      password: fields.P || undefined,
      security: toWiFiSecurity(fields.T),
      hidden: fields.H?.toLowerCase() === 'true',
    };
    return {
      type: 'wifi',
      title: `WiFi: ${ssid}`,
      metadata: { wifi: wifiData },
    };
  }

  // SMS check (SMSTO:+123:message or sms:+123?body=message)
  if (/^smsto:/i.test(trimmed)) {
    const [phone = '', ...rest] = trimmed.substring(6).split(':');
    return {
      type: 'sms',
      title: `SMS: ${phone}`,
      metadata: { sms: { phone, message: rest.join(':') } },
    };
  }
  if (/^sms:/i.test(trimmed)) {
    const [phone = '', query] = trimmed.substring(4).split('?');
    const message = query ? new URLSearchParams(query).get('body') || '' : '';
    return {
      type: 'sms',
      title: `SMS: ${phone}`,
      metadata: { sms: { phone, message } },
    };
  }

  // Email check (mailto:email@example.com?subject=...&body=...) or direct email
  if (/^mailto:/i.test(trimmed) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    let email = trimmed;
    let subject = '';
    let body = '';

    if (/^mailto:/i.test(trimmed)) {
      const parts = trimmed.substring(7).split('?');
      email = parts[0];
      if (parts[1]) {
        const searchParams = new URLSearchParams(parts[1]);
        subject = searchParams.get('subject') || '';
        body = searchParams.get('body') || '';
      }
    }

    const emailData: EmailContent = { email, subject, body };
    return {
      type: 'email',
      title: `Email: ${email}`,
      metadata: { email: emailData },
    };
  }

  // Phone check (tel:+123456789 or tel:123456789)
  if (
    /^tel:/i.test(trimmed) ||
    /^(\+?\d{1,4}[\s-]?)?\(?\d{2,5}\)?[\s-]?\d{3,5}[\s-]?\d{3,5}$/.test(trimmed)
  ) {
    const phone = /^tel:/i.test(trimmed) ? trimmed.substring(4) : trimmed;
    return {
      type: 'phone',
      title: `Phone: ${phone}`,
      metadata: { phone },
    };
  }

  // Fallback text
  const titlePreview = trimmed.length > 30 ? `${trimmed.substring(0, 30)}...` : trimmed;
  return {
    type: 'text',
    title: titlePreview || 'Text Content',
  };
}

export function buildWiFiPayload(data: WiFiContent): string {
  const security = data.security || 'WPA';
  const ssid = escapeWiFiValue(data.ssid);
  const password =
    security !== 'nopass' && data.password ? `P:${escapeWiFiValue(data.password)};` : '';
  const hidden = data.hidden ? 'H:true;' : '';
  return `WIFI:T:${security};S:${ssid};${password}${hidden};`;
}

export function buildEmailPayload(data: EmailContent): string {
  const query: string[] = [];
  if (data.subject) query.push(`subject=${encodeURIComponent(data.subject)}`);
  if (data.body) query.push(`body=${encodeURIComponent(data.body)}`);
  const queryString = query.length > 0 ? `?${query.join('&')}` : '';
  return `mailto:${data.email.trim()}${queryString}`;
}

export function buildPhonePayload(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 3 && digits.length <= 15 && /^\+?[\d\s()-]+$/.test(phone.trim());
}
