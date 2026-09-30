import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import {
  FileText,
  Globe,
  Wifi,
  Mail,
  Phone,
  Copy,
  Share2,
  Download,
  Palette,
  Check,
} from 'lucide-react-native';
import * as Sharing from 'expo-sharing';

import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SegmentedControl } from '../../components/SegmentedControl';
import { TypeBadge } from '../../components/TypeBadge';
import { useToast } from '../../components/Toast';
import { useHistory } from '../../hooks/useHistory';
import { QRType, WiFiSecurity } from '../../types/qr';
import {
  buildWiFiPayload,
  buildEmailPayload,
  buildPhonePayload,
  isValidEmail,
  isValidPhone,
} from '../../services/qr';
import { copyText } from '../../services/clipboard';
import { QRCodeRef, saveQrImage, shareQrImage } from '../../services/share';
import { COLORS } from '../../constants/theme';

type GeneratorType = Exclude<QRType, 'sms'>;

interface GeneratedQR {
  payload: string;
  title: string;
  type: GeneratorType;
}

const CATEGORIES = [
  { type: 'text', title: 'Text', icon: FileText, bg: COLORS.primaryPastel },
  { type: 'url', title: 'Website URL', icon: Globe, bg: COLORS.pastelBlue },
  { type: 'wifi', title: 'WiFi Network', icon: Wifi, bg: COLORS.pastelGreen },
  { type: 'email', title: 'Email', icon: Mail, bg: COLORS.pastelPurple },
  { type: 'phone', title: 'Phone Number', icon: Phone, bg: COLORS.pastelYellow },
] as const;

const QR_COLORS = [
  { label: 'Black', value: COLORS.black },
  { label: 'Orange', value: COLORS.primary },
];

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.substring(0, max)}...` : value;
}

export default function GenerateScreen() {
  const qrRef = useRef<QRCodeRef | null>(null);
  const [selectedType, setSelectedType] = useState<GeneratorType>('text');
  const [qrColor, setQrColor] = useState<string>(COLORS.black);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [textContent, setTextContent] = useState('');
  const [urlContent, setUrlContent] = useState('');

  // Wifi form
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiSecurity, setWifiSecurity] = useState<WiFiSecurity>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);

  // Email form
  const [emailAddress, setEmailAddress] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Phone form
  const [phoneNumber, setPhoneNumber] = useState('');

  const [generated, setGenerated] = useState<GeneratedQR | null>(null);
  const { addHistoryItem } = useHistory();
  const showToast = useToast();

  const selectType = (type: GeneratorType) => {
    setSelectedType(type);
    setError(null);
  };

  /** Returns the payload + title, or an error message for invalid input. */
  const buildPayload = (): { payload: string; title: string } | string => {
    switch (selectedType) {
      case 'text': {
        const text = textContent.trim();
        if (!text) return 'Please enter some text.';
        return { payload: text, title: truncate(text, 20) };
      }
      case 'url': {
        let url = urlContent.trim();
        if (!url) return 'Please enter a URL.';
        if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
        if (!/^https?:\/\/[^\s/$.?#][^\s]*\.[^\s]{2,}/i.test(url)) {
          return 'Please enter a valid URL, e.g. example.com';
        }
        return { payload: url, title: truncate(url, 22) };
      }
      case 'wifi': {
        const ssid = wifiSsid.trim();
        if (!ssid) return 'Please enter the network name (SSID).';
        if (wifiSecurity !== 'nopass' && !wifiPassword) {
          return 'Please enter the WiFi password, or choose "None".';
        }
        return {
          payload: buildWiFiPayload({
            ssid,
            password: wifiPassword,
            security: wifiSecurity,
            hidden: wifiHidden,
          }),
          title: `WiFi: ${ssid}`,
        };
      }
      case 'email': {
        const email = emailAddress.trim();
        if (!email) return 'Please enter an email address.';
        if (!isValidEmail(email)) return 'Please enter a valid email address.';
        return {
          payload: buildEmailPayload({ email, subject: emailSubject, body: emailBody }),
          title: `Email: ${email}`,
        };
      }
      case 'phone': {
        const phone = phoneNumber.trim();
        if (!phone) return 'Please enter a phone number.';
        if (!isValidPhone(phone)) return 'Please enter a valid phone number.';
        return { payload: buildPhonePayload(phone), title: `Phone: ${phone}` };
      }
    }
  };

  const handleGenerate = async () => {
    const built = buildPayload();
    if (typeof built === 'string') {
      setError(built);
      return;
    }
    setError(null);
    setGenerated({ ...built, type: selectedType });
    await addHistoryItem(built.payload, 'generated', selectedType, built.title);
    showToast('Saved to history');
  };

  const handleDownloadQr = async () => {
    if (!generated) return;
    try {
      const fileUri = await saveQrImage(qrRef.current);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: 'image/png', dialogTitle: 'Save QR Code' });
      } else {
        showToast('Saving is not supported on this device');
      }
    } catch (err) {
      console.warn(err);
      showToast('Could not save QR image');
    }
  };

  const handleCopyContent = async () => {
    if (!generated) return;
    await copyText(generated.payload, showToast);
  };

  const clearError =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      if (error) setError(null);
    };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <ScreenHeader title="Generate QR" subtitle="Create custom QR codes" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1 px-5 pt-2"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          {/* Category selector grid */}
          <Text className="text-sm font-bold text-dark mb-3">Select Content Type</Text>
          <View className="flex-row flex-wrap justify-between mb-6">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedType === cat.type;
              return (
                <TouchableOpacity
                  key={cat.type}
                  onPress={() => selectType(cat.type)}
                  activeOpacity={0.8}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={cat.title}
                  className={`w-[48%] p-4 rounded-2xl mb-3 border bg-white ${
                    isSelected ? 'border-primary' : 'border-gray-100'
                  }`}
                  style={{
                    shadowColor: isSelected ? COLORS.primary : '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isSelected ? 0.2 : 0.03,
                    shadowRadius: 4,
                    elevation: isSelected ? 3 : 1,
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="p-2.5 rounded-xl mb-2" style={{ backgroundColor: cat.bg }}>
                      <Icon size={20} color={isSelected ? COLORS.primary : COLORS.black} />
                    </View>
                    {isSelected && (
                      <View className="w-5 h-5 rounded-full bg-primary items-center justify-center">
                        <Check size={12} color={COLORS.white} />
                      </View>
                    )}
                  </View>
                  <Text className="font-bold text-base text-dark">{cat.title}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Input Forms */}
          <View
            className="bg-white p-5 rounded-3xl border border-gray-100 mb-8"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-dark">Configure Details</Text>
              <TypeBadge type={selectedType} />
            </View>

            {selectedType === 'text' && (
              <Input
                label="Text Content"
                placeholder="Enter any text here..."
                multiline
                numberOfLines={4}
                value={textContent}
                onChangeText={clearError(setTextContent)}
              />
            )}

            {selectedType === 'url' && (
              <Input
                label="Website Link"
                placeholder="https://example.com"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                value={urlContent}
                onChangeText={clearError(setUrlContent)}
              />
            )}

            {selectedType === 'wifi' && (
              <View>
                <Input
                  label="Network Name (SSID)"
                  placeholder="MyHomeNetwork"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={wifiSsid}
                  onChangeText={clearError(setWifiSsid)}
                />
                <Text className="text-sm font-semibold text-dark mb-1.5 ml-1">Security</Text>
                <SegmentedControl
                  options={[
                    { label: 'WPA/WPA2', value: 'WPA' },
                    { label: 'WEP', value: 'WEP' },
                    { label: 'None', value: 'nopass' },
                  ]}
                  selectedValue={wifiSecurity}
                  onSelect={clearError(setWifiSecurity)}
                />
                {wifiSecurity !== 'nopass' && (
                  <Input
                    label="Password"
                    placeholder="WiFi Password"
                    secureTextEntry
                    autoCapitalize="none"
                    value={wifiPassword}
                    onChangeText={clearError(setWifiPassword)}
                  />
                )}
                <View className="flex-row items-center justify-between mb-4 ml-1">
                  <Text className="text-sm font-semibold text-dark">Hidden network</Text>
                  <Switch
                    value={wifiHidden}
                    onValueChange={setWifiHidden}
                    trackColor={{ false: '#E5E7EB', true: COLORS.primaryLight }}
                    thumbColor={wifiHidden ? COLORS.primary : COLORS.white}
                    accessibilityLabel="Hidden network"
                  />
                </View>
              </View>
            )}

            {selectedType === 'email' && (
              <View>
                <Input
                  label="Email Address"
                  placeholder="contact@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={emailAddress}
                  onChangeText={clearError(setEmailAddress)}
                />
                <Input
                  label="Subject (Optional)"
                  placeholder="Hello there"
                  value={emailSubject}
                  onChangeText={setEmailSubject}
                />
                <Input
                  label="Message Body (Optional)"
                  placeholder="Write your email body..."
                  multiline
                  numberOfLines={3}
                  value={emailBody}
                  onChangeText={setEmailBody}
                />
              </View>
            )}

            {selectedType === 'phone' && (
              <Input
                label="Phone Number"
                placeholder="+66 81 234 5678"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={clearError(setPhoneNumber)}
              />
            )}

            {error && (
              <Text className="text-sm text-red-600 mb-3 ml-1" accessibilityLiveRegion="polite">
                {error}
              </Text>
            )}

            <Button title="Generate QR Code" onPress={handleGenerate} variant="primary" fullWidth />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Generated QR Code Sheet */}
      <BottomSheet
        visible={!!generated}
        title="Your QR Code"
        onClose={() => setGenerated(null)}
        headerRight={generated ? <TypeBadge type={generated.type} /> : undefined}
      >
        {/* QR Preview Card */}
        <View className="items-center justify-center p-6 bg-bg rounded-3xl border border-orange-100 mb-4">
          {generated && (
            <QRCode
              getRef={(c: QRCodeRef | null) => (qrRef.current = c)}
              value={generated.payload}
              size={200}
              color={qrColor}
              backgroundColor={COLORS.white}
              quietZone={8}
            />
          )}

          <View className="mt-3 px-3.5 py-1.5 bg-white rounded-full border border-gray-100 items-center justify-center max-w-[90%]">
            <Text
              className="text-xs font-semibold text-dark text-center"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {generated?.title}
            </Text>
          </View>
        </View>

        {/* Color Selector */}
        <View className="flex-row items-center justify-between bg-gray-50 p-3 rounded-2xl mb-4">
          <View className="flex-row items-center">
            <Palette size={18} color={COLORS.gray} />
            <Text className="text-xs font-bold text-dark ml-2">Color Style:</Text>
          </View>
          <View className="flex-row">
            {QR_COLORS.map((option) => {
              const isSelected = qrColor === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setQrColor(option.value)}
                  accessibilityRole="radio"
                  accessibilityLabel={`${option.label} QR`}
                  accessibilityState={{ selected: isSelected }}
                  className={`w-10 h-10 rounded-full border-2 ml-2 items-center justify-center ${
                    isSelected ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <View
                    className="w-7 h-7 rounded-full items-center justify-center"
                    style={{ backgroundColor: option.value }}
                  >
                    {isSelected && <Check size={14} color={COLORS.white} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row mb-3">
          <View className="flex-1 mr-2">
            <Button
              title="Save"
              onPress={handleDownloadQr}
              variant="primary"
              size="sm"
              icon={<Download size={16} color={COLORS.white} />}
              fullWidth
            />
          </View>
          <View className="flex-1 mr-2">
            <Button
              title="Share"
              onPress={() =>
                generated && shareQrImage(qrRef.current, generated.payload, 'Share QR Code')
              }
              variant="dark"
              size="sm"
              icon={<Share2 size={16} color={COLORS.white} />}
              fullWidth
            />
          </View>
          <View className="flex-1">
            <Button
              title="Copy"
              onPress={handleCopyContent}
              variant="secondary"
              size="sm"
              icon={<Copy size={16} color={COLORS.black} />}
              fullWidth
            />
          </View>
        </View>

        <Button
          title="Create Another"
          onPress={() => setGenerated(null)}
          variant="ghost"
          fullWidth
        />
      </BottomSheet>
    </SafeAreaView>
  );
}
