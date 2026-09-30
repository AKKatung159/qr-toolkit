import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Scan, PlusSquare, QrCode, Sparkles } from 'lucide-react-native';

import { Button } from '../../components/Button';
import { HistoryItem } from '../../components/HistoryItem';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useHistory } from '../../hooks/useHistory';
import { useHistoryActions } from '../../hooks/useHistoryActions';
import { COLORS } from '../../constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { history } = useHistory();
  const { copy, share, confirmDelete } = useHistoryActions();
  const recent = history.slice(0, 3);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <ScreenHeader
        title="QR Toolkit"
        subtitle="Scan or create QR codes quickly & privately"
        rightElement={
          <View className="w-10 h-10 rounded-full bg-primary-pastel items-center justify-center">
            <QrCode size={22} color={COLORS.primary} />
          </View>
        }
      />

      <ScrollView className="flex-1 px-5 pt-2" showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View
          className="bg-dark rounded-3xl p-6 mb-6 relative overflow-hidden"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 3,
          }}
        >
          <View className="flex-row items-center mb-2">
            <Sparkles size={16} color={COLORS.primary} />
            <Text className="text-xs font-bold text-primary uppercase tracking-wider ml-1.5">
              Offline & Private
            </Text>
          </View>
          <Text className="text-2xl font-black text-white mb-2 leading-tight">
            Fast, Simple & Powerful QR Tools
          </Text>
          <Text className="text-sm text-gray-300 mb-5 leading-relaxed">
            Scan physical codes or design high-contrast QR codes in seconds.
          </Text>

          <View className="flex-row">
            <View className="flex-1 mr-2">
              <Button
                title="Scan QR"
                onPress={() => router.push('/(tabs)/scan')}
                variant="primary"
                size="md"
                icon={<Scan size={18} color={COLORS.white} />}
                fullWidth
              />
            </View>
            <View className="flex-1">
              <Button
                title="Create QR"
                onPress={() => router.push('/(tabs)/generate')}
                variant="secondary"
                size="md"
                icon={<PlusSquare size={18} color={COLORS.black} />}
                fullWidth
              />
            </View>
          </View>
        </View>

        {/* Recent */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-bold text-dark" accessibilityRole="header">
            Recent Activity
          </Text>
          {history.length > 0 && (
            <Button
              title="See All"
              onPress={() => router.push('/(tabs)/history')}
              variant="ghost"
              size="sm"
            />
          )}
        </View>

        {recent.length === 0 ? (
          <View className="bg-white rounded-2xl p-6 border border-gray-100 items-center justify-center mb-6">
            <Text className="text-base font-bold text-dark mb-1">No QR Codes Yet</Text>
            <Text className="text-xs text-gray-500 text-center mb-4">
              Scanned or generated QR codes will show up here.
            </Text>
            <Button
              title="Scan First Code"
              onPress={() => router.push('/(tabs)/scan')}
              variant="secondary"
              size="sm"
            />
          </View>
        ) : (
          recent.map((item) => (
            <HistoryItem
              key={item.id}
              item={item}
              onPress={() => router.push({ pathname: '/(tabs)/history', params: { id: item.id } })}
              onCopy={() => copy(item.content)}
              onShare={() => share(item.content)}
              onDelete={() => confirmDelete(item)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
