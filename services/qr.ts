import { QRType, WiFiContent, EmailContent } from '../types/qr';

export function detectQRType(content: string): { type: QRType; title: string; metadata?: any } {
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
  if (trimmed.startsWith('WIFI:')) {
    const ssidMatch = trimmed.match(/S:([^;]+)/);
    const passMatch = trimmed.match(/P:([^;]+)/);
    const secMatch = trimmed.match(/T:([^;]+)/);
    const ssid = ssidMatch ? ssidMatch[1] : 'WiFi Network';
    const wifiData: WiFiContent = {
      ssid,
      password: passMatch ? passMatch[1] : undefined,
      security: secMatch ? (secMatch[1] as any) : 'WPA',
    };
    return {
      type: 'wifi',
      title: `WiFi: ${ssid}`,
      metadata: { wifi: wifiData },
    };
  }

  // Email check (mailto:email@example.com?subject=...&body=...) or direct email
  if (trimmed.startsWith('mailto:') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    let email = trimmed;
    let subject = '';
    let body = '';

    if (trimmed.startsWith('mailto:')) {
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
    trimmed.startsWith('tel:') ||
    /^(\+?\d{1,4}[\s-]?)?\(?\d{2,5}\)?[\s-]?\d{3,5}[\s-]?\d{3,5}$/.test(trimmed)
  ) {
    const phone = trimmed.startsWith('tel:') ? trimmed.substring(4) : trimmed;
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
  const password = data.password ? `P:${data.password};` : '';
  const hidden = data.hidden ? 'H:true;' : '';
  return `WIFI:S:${data.ssid};T:${security};${password}${hidden};`;
}

export function buildEmailPayload(data: EmailContent): string {
  const query: string[] = [];
  if (data.subject) query.push(`subject=${encodeURIComponent(data.subject)}`);
  if (data.body) query.push(`body=${encodeURIComponent(data.body)}`);
  const queryString = query.length > 0 ? `?${query.join('&')}` : '';
  return `mailto:${data.email}${queryString}`;
}

export function buildPhonePayload(phone: string): string {
  return `tel:${phone}`;
}
