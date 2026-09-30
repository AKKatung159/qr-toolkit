import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Alert, Share } from 'react-native';
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
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ScreenHeader } from '../../components/ScreenHeader';
import { TypeBadge } from '../../components/TypeBadge';
import { useHistory } from '../../hooks/useHistory';
import { QRType } from '../../types/qr';
import { buildWiFiPayload, buildEmailPayload, buildPhonePayload } from '../../services/qr';
import { COLORS } from '../../constants/theme';

export default function GenerateScreen() {
  const svgRef = useRef<any>(null);
  const [selectedType, setSelectedType] = useState<QRType>('text');
  const [qrColor, setQrColor] = useState<string>(COLORS.black);

  // Form states
  const [textContent, setTextContent] = useState('');
  const [urlContent, setUrlContent] = useState('');

  // Wifi form
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiSecurity, setWifiSecurity] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');

  // Email form
  const [emailAddress, setEmailAddress] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Phone form
  const [phoneNumber, setPhoneNumber] = useState('');

  // Result modal
  const [generatedPayload, setGeneratedPayload] = useState<{
    payload: string;
    title: string;
    type: QRType;
  } | null>(null);
  const { addHistoryItem } = useHistory();

  const handleGenerate = async () => {
    let payload = '';
    let title = '';

    switch (selectedType) {
      case 'text':
        if (!textContent.trim()) return Alert.alert('Required', 'Please enter text content.');
        payload = textContent.trim();
        title = payload.length > 20 ? `${payload.substring(0, 20)}...` : payload;
        break;
      case 'url':
        if (!urlContent.trim()) return Alert.alert('Required', 'Please enter a URL.');
        payload = urlContent.trim();
        if (!/^https?:\/\//i.test(payload)) payload = `https://${payload}`;
        title = payload.length > 22 ? `${payload.substring(0, 22)}...` : payload;
        break;
      case 'wifi':
        if (!wifiSsid.trim()) return Alert.alert('Required', 'Please enter network name (SSID).');
        payload = buildWiFiPayload({
          ssid: wifiSsid,
          password: wifiPassword,
          security: wifiSecurity,
        });
        title = `WiFi: ${wifiSsid}`;
        break;
      case 'email':
        if (!emailAddress.trim()) return Alert.alert('Required', 'Please enter email address.');
        payload = buildEmailPayload({
          email: emailAddress,
          subject: emailSubject,
          body: emailBody,
        });
        title = `Email: ${emailAddress}`;
        break;
      case 'phone':
        if (!phoneNumber.trim()) return Alert.alert('Required', 'Please enter phone number.');
        payload = buildPhonePayload(phoneNumber);
        title = `Phone: ${phoneNumber}`;
        break;
    }

    setGeneratedPayload({ payload, title, type: selectedType });
    await addHistoryItem(payload, 'generated', selectedType, title);
  };

  const getQrImageUri = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!svgRef.current) {
        reject(new Error('QR reference is not ready'));
        return;
      }
      svgRef.current.toDataURL(async (data: string) => {
        try {
          const fileUri = `${FileSystem.cacheDirectory}qr_code_${Date.now()}.png`;
          await FileSystem.writeAsStringAsync(fileUri, data, {
            encoding: FileSystem.EncodingType.Base64,
          });
          resolve(fileUri);
        } catch (err) {
          reject(err);
        }
      });
    });
  };

  const handleDownloadQr = async () => {
    try {
      const fileUri = await getQrImageUri();
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'image/png',
          dialogTitle: 'Save / Download QR Code',
        });
      } else {
        Alert.alert('Error', 'Sharing/Saving is not supported on this device.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not save QR code image.');
    }
  };

  const handleShareQrImage = async () => {
    try {
      const fileUri = await getQrImageUri();
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'image/png',
          dialogTitle: 'Share QR Code Image',
        });
      } else {
        await Share.share({ message: generatedPayload?.payload || '' });
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not share QR code image.');
    }
  };

  const handleCopyContent = async () => {
    if (generatedPayload) {
      await Clipboard.setStringAsync(generatedPayload.payload);
      Alert.alert('Copied!', 'Payload content copied to clipboard.');
    }
  };

  const categories = [
    { type: 'text' as QRType, title: 'Text', icon: FileText, bg: COLORS.primaryPastel },
    { type: 'url' as QRType, title: 'Website URL', icon: Globe, bg: COLORS.pastelBlue },
    { type: 'wifi' as QRType, title: 'WiFi Network', icon: Wifi, bg: COLORS.pastelGreen },
    { type: 'email' as QRType, title: 'Email', icon: Mail, bg: COLORS.pastelPurple },
    { type: 'phone' as QRType, title: 'Phone Number', icon: Phone, bg: COLORS.pastelYellow },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#FFF9F5]">
      <ScreenHeader title="Generate QR" subtitle="Create custom QR codes" />

      <ScrollView className="flex-1 px-5 pt-2" showsVerticalScrollIndicator={false}>
        {/* Category selector grid */}
        <Text className="text-sm font-bold text-[#171717] mb-3">Select Content Type</Text>
        <View className="flex-row flex-wrap justify-between mb-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedType === cat.type;
            return (
              <TouchableOpacity
                key={cat.type}
                onPress={() => setSelectedType(cat.type)}
                activeOpacity={0.8}
                className={`w-[48%] p-4 rounded-2xl mb-3 border ${
                  isSelected ? 'border-[#FF8A3D] bg-white' : 'border-gray-100 bg-white'
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
                    <View className="w-5 h-5 rounded-full bg-[#FF8A3D] items-center justify-center">
                      <Check size={12} color="#FFF" />
                    </View>
                  )}
                </View>
                <Text className="font-bold text-base text-[#171717]">{cat.title}</Text>
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
            <Text className="text-lg font-bold text-[#171717]">Configure Details</Text>
            <TypeBadge type={selectedType} />
          </View>

          {selectedType === 'text' && (
            <Input
              label="Text Content"
              placeholder="Enter any text here..."
              multiline
              numberOfLines={4}
              value={textContent}
              onChangeText={setTextContent}
            />
          )}

          {selectedType === 'url' && (
            <Input
              label="Website Link"
              placeholder="https://example.com"
              autoCapitalize="none"
              keyboardType="url"
              value={urlContent}
              onChangeText={setUrlContent}
            />
          )}

          {selectedType === 'wifi' && (
            <View>
              <Input
                label="Network Name (SSID)"
                placeholder="MyHomeNetwork"
                value={wifiSsid}
                onChangeText={setWifiSsid}
              />
              <Input
                label="Password"
                placeholder="WiFi Password"
                secureTextEntry
                value={wifiPassword}
                onChangeText={setWifiPassword}
              />
            </View>
          )}

          {selectedType === 'email' && (
            <View>
              <Input
                label="Email Address"
                placeholder="contact@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={emailAddress}
                onChangeText={setEmailAddress}
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
              placeholder="+1 234 567 8900"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          )}

          <Button title="Generate QR Code" onPress={handleGenerate} variant="primary" fullWidth />
        </View>
      </ScrollView>

      {/* Generated QR Code Modal */}
      <Modal visible={!!generatedPayload} transparent animationType="slide">
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-t-3xl p-6 border-t border-gray-100">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-[#171717]">Your QR Code</Text>
              <TypeBadge type={generatedPayload?.type || 'text'} />
            </View>

            {/* QR Preview Card */}
            <View className="items-center justify-center p-6 bg-[#FFF9F5] rounded-3xl border border-orange-100 mb-4">
              {generatedPayload && (
                <QRCode
                  getRef={(c) => (svgRef.current = c)}
                  value={generatedPayload.payload}
                  size={200}
                  color={qrColor}
                  backgroundColor="transparent"
                />
              )}

              <View className="mt-3 px-3.5 py-1.5 bg-white rounded-full border border-gray-100 items-center justify-center max-w-[90%]">
                <Text
                  className="text-xs font-semibold text-[#171717] text-center"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {generatedPayload?.title}
                </Text>
              </View>
            </View>

            {/* Color Selector */}
            <View className="flex-row items-center justify-between bg-gray-50 p-3 rounded-2xl mb-4">
              <View className="flex-row items-center space-x-2">
                <Palette size={18} color={COLORS.gray} />
                <Text className="text-xs font-bold text-[#171717]">Color Style:</Text>
              </View>
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  onPress={() => setQrColor(COLORS.black)}
                  className={`w-7 h-7 rounded-full bg-[#171717] border-2 mr-2 ${
                    qrColor === COLORS.black ? 'border-[#FF8A3D]' : 'border-transparent'
                  }`}
                />
                <TouchableOpacity
                  onPress={() => setQrColor(COLORS.primary)}
                  className={`w-7 h-7 rounded-full bg-[#FF8A3D] border-2 ${
                    qrColor === COLORS.primary ? 'border-[#171717]' : 'border-transparent'
                  }`}
                />
              </View>
            </View>

            {/* Actions */}
            <View className="space-y-3">
              <View className="flex-row space-x-2 mb-2">
                <View className="flex-1 mr-1">
                  <Button
                    title="Download"
                    onPress={handleDownloadQr}
                    variant="primary"
                    icon={<Download size={16} color="#FFF" />}
                    fullWidth
                  />
                </View>
                <View className="flex-1 mr-1">
                  <Button
                    title="Share Image"
                    onPress={handleShareQrImage}
                    variant="dark"
                    icon={<Share2 size={16} color="#FFF" />}
                    fullWidth
                  />
                </View>
                <View className="flex-1">
                  <Button
                    title="Copy Text"
                    onPress={handleCopyContent}
                    variant="secondary"
                    icon={<Copy size={16} color="#171717" />}
                    fullWidth
                  />
                </View>
              </View>

              <Button
                title="Close"
                onPress={() => setGeneratedPayload(null)}
                variant="ghost"
                fullWidth
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
