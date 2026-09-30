import React, { useState, useRef } from 'react';
import { View, ScrollView, Pressable, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Copy, Share2, Download, Check } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';

import { BottomSheet } from '../../components/BottomSheet';
import { Button, buttonIconColor } from '../../components/Button';
import { Input } from '../../components/Input';
import { QRCard } from '../../components/QRCard';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SegmentedControl } from '../../components/SegmentedControl';
import { Text } from '../../components/Text';
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
import { COLORS, SHADOW } from '../../constants/theme';
import { ICON_STROKE, QR_TYPES } from '../../constants/qrTypes';

type GeneratorType = Exclude<QRType, 'sms'>;
type Field = 'text' | 'url' | 'ssid' | 'password' | 'email' | 'phone';
type FieldError = { field: Field; message: string };

interface GeneratedQR {
  payload: string;
  title: string;
  type: GeneratorType;
}

const GENERATOR_TYPES: GeneratorType[] = ['text', 'url', 'wifi', 'email', 'phone'];

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
  const [error, setError] = useState<FieldError | null>(null);

  const [textContent, setTextContent] = useState('');
  const [urlContent, setUrlContent] = useState('');

  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiSecurity, setWifiSecurity] = useState<WiFiSecurity>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);

  const [emailAddress, setEmailAddress] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const [phoneNumber, setPhoneNumber] = useState('');

  const [generated, setGenerated] = useState<GeneratedQR | null>(null);
  const { addHistoryItem } = useHistory();
  const showToast = useToast();

  const selectType = (type: GeneratorType) => {
    setSelectedType(type);
    setError(null);
  };

  const errorFor = (field: Field) => (error?.field === field ? error.message : undefined);

  /** Returns the payload + title, or the field that's invalid and why. */
  const buildPayload = (): { payload: string; title: string } | FieldError => {
    switch (selectedType) {
      case 'text': {
        const text = textContent.trim();
        if (!text) return { field: 'text', message: 'Enter some text.' };
        return { payload: text, title: truncate(text, 20) };
      }
      case 'url': {
        let url = urlContent.trim();
        if (!url) return { field: 'url', message: 'Enter a link.' };
        if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
        if (!/^https?:\/\/[^\s/$.?#][^\s]*\.[^\s]{2,}/i.test(url)) {
          return { field: 'url', message: 'That link looks incomplete, e.g. example.com' };
        }
        return { payload: url, title: truncate(url, 22) };
      }
      case 'wifi': {
        const ssid = wifiSsid.trim();
        if (!ssid) return { field: 'ssid', message: 'Enter the network name.' };
        if (wifiSecurity !== 'nopass' && !wifiPassword) {
          return { field: 'password', message: 'Enter the password, or choose None.' };
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
        if (!email) return { field: 'email', message: 'Enter an email address.' };
        if (!isValidEmail(email))
          return { field: 'email', message: 'That email looks incomplete.' };
        return {
          payload: buildEmailPayload({ email, subject: emailSubject, body: emailBody }),
          title: `Email: ${email}`,
        };
      }
      case 'phone': {
        const phone = phoneNumber.trim();
        if (!phone) return { field: 'phone', message: 'Enter a phone number.' };
        if (!isValidPhone(phone))
          return { field: 'phone', message: 'That number looks incomplete.' };
        return { payload: buildPhonePayload(phone), title: `Phone: ${phone}` };
      }
    }
  };

  const handleGenerate = async () => {
    const built = buildPayload();
    if ('field' in built) {
      setError(built);
      return;
    }
    setError(null);
    setGenerated({ ...built, type: selectedType });
    await addHistoryItem(built.payload, 'generated', selectedType, built.title);
    showToast('Saved to history');
  };

  const handleSave = async () => {
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
      showToast('Could not save the image');
    }
  };

  const clearError =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      if (error) setError(null);
    };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <ScreenHeader title="Create" subtitle="Pick what the code should hold." />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          contentContainerClassName="pb-8"
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="px-5 pb-5"
            accessibilityRole="radiogroup"
          >
            {GENERATOR_TYPES.map((type) => {
              const { label, Icon } = QR_TYPES[type];
              const isSelected = selectedType === type;
              return (
                <Pressable
                  key={type}
                  onPress={() => selectType(type)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  className={`flex-row items-center h-11 pl-3.5 pr-4 mr-2 rounded-full ${
                    isSelected ? 'bg-dark' : 'bg-white border border-line'
                  }`}
                  style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.96 : 1 }] })}
                >
                  <Icon
                    size={17}
                    color={isSelected ? COLORS.primary : COLORS.black}
                    strokeWidth={ICON_STROKE}
                  />
                  <Text
                    className={`font-body-semibold text-[15px] ml-2 ${
                      isSelected ? 'text-white' : 'text-dark'
                    }`}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View className="bg-white mx-5 p-5 rounded-3xl" style={{ boxShadow: SHADOW.soft }}>
            {selectedType === 'text' && (
              <Input
                label="Text"
                placeholder="Anything you want to share"
                multiline
                value={textContent}
                onChangeText={clearError(setTextContent)}
                error={errorFor('text')}
              />
            )}

            {selectedType === 'url' && (
              <Input
                label="Link"
                placeholder="example.com"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                value={urlContent}
                onChangeText={clearError(setUrlContent)}
                hint="https:// is added for you."
                error={errorFor('url')}
              />
            )}

            {selectedType === 'wifi' && (
              <View>
                <Input
                  label="Network name"
                  placeholder="Home WiFi"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={wifiSsid}
                  onChangeText={clearError(setWifiSsid)}
                  error={errorFor('ssid')}
                />
                <Text className="font-body-semibold text-sm text-dark mb-2">Security</Text>
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
                    placeholder="Network password"
                    secureTextEntry
                    autoCapitalize="none"
                    value={wifiPassword}
                    onChangeText={clearError(setWifiPassword)}
                    error={errorFor('password')}
                  />
                )}
                <View className="flex-row items-center justify-between mb-5">
                  <View className="flex-1 pr-4">
                    <Text className="font-body-semibold text-sm text-dark">Hidden network</Text>
                    <Text className="text-sm text-muted mt-0.5">
                      Turn on if the network name isn&apos;t broadcast.
                    </Text>
                  </View>
                  <Switch
                    value={wifiHidden}
                    onValueChange={setWifiHidden}
                    trackColor={{ false: COLORS.gray, true: COLORS.primary }}
                    thumbColor={COLORS.white}
                    accessibilityLabel="Hidden network"
                  />
                </View>
              </View>
            )}

            {selectedType === 'email' && (
              <View>
                <Input
                  label="Email address"
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={emailAddress}
                  onChangeText={clearError(setEmailAddress)}
                  error={errorFor('email')}
                />
                <Input
                  label="Subject (optional)"
                  placeholder="Hello"
                  value={emailSubject}
                  onChangeText={setEmailSubject}
                />
                <Input
                  label="Message (optional)"
                  placeholder="Write a message"
                  multiline
                  value={emailBody}
                  onChangeText={setEmailBody}
                />
              </View>
            )}

            {selectedType === 'phone' && (
              <Input
                label="Phone number"
                placeholder="+66 81 234 5678"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={clearError(setPhoneNumber)}
                error={errorFor('phone')}
              />
            )}

            <Button title="Create code" onPress={handleGenerate} fullWidth />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomSheet
        visible={!!generated}
        title="Your code"
        onClose={() => setGenerated(null)}
        headerRight={generated ? <TypeBadge type={generated.type} size="sm" /> : undefined}
      >
        {generated && (
          <QRCard
            value={generated.payload}
            caption={generated.title}
            color={qrColor}
            qrRef={qrRef}
          />
        )}

        <View className="flex-row items-center justify-between mb-5">
          <Text className="font-body-semibold text-[15px] text-dark">Code color</Text>
          <View className="flex-row" accessibilityRole="radiogroup">
            {QR_COLORS.map((option) => {
              const isSelected = qrColor === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setQrColor(option.value)}
                  accessibilityRole="radio"
                  accessibilityLabel={option.label}
                  accessibilityState={{ selected: isSelected }}
                  className={`w-11 h-11 rounded-full ml-2 items-center justify-center border-2 ${
                    isSelected ? 'border-dark' : 'border-transparent'
                  }`}
                >
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: option.value }}
                  >
                    {isSelected && (
                      <Check
                        size={15}
                        color={option.value === COLORS.black ? COLORS.white : COLORS.black}
                        strokeWidth={2.5}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="flex-row mb-3">
          <View className="flex-1 mr-2">
            <Button
              title="Share"
              onPress={() =>
                generated && shareQrImage(qrRef.current, generated.payload, 'Share QR Code')
              }
              icon={
                <Share2 size={18} color={buttonIconColor('primary')} strokeWidth={ICON_STROKE} />
              }
              fullWidth
            />
          </View>
          <View className="flex-1 mr-2">
            <Button
              title="Save"
              onPress={handleSave}
              variant="dark"
              icon={
                <Download size={18} color={buttonIconColor('dark')} strokeWidth={ICON_STROKE} />
              }
              fullWidth
            />
          </View>
          <Pressable
            onPress={() => generated && copyText(generated.payload, showToast)}
            accessibilityRole="button"
            accessibilityLabel="Copy content"
            className="w-14 h-14 rounded-full bg-primary-pastel items-center justify-center"
            style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.94 : 1 }] })}
          >
            <Copy size={20} color={COLORS.black} strokeWidth={ICON_STROKE} />
          </Pressable>
        </View>

        <Button
          title="Create another"
          onPress={() => setGenerated(null)}
          variant="ghost"
          fullWidth
        />
      </BottomSheet>
    </SafeAreaView>
  );
}
