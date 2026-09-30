import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowUpRight, ScanLine, SquarePlus } from 'lucide-react-native';

import { EmptyState } from '../../components/EmptyState';
import { HistoryGroup, HistoryItem } from '../../components/HistoryItem';
import { Text } from '../../components/Text';
import { useHistory } from '../../hooks/useHistory';
import { COLORS, SHADOW } from '../../constants/theme';
import { ICON_STROKE } from '../../constants/qrTypes';

export default function HomeScreen() {
  const router = useRouter();
  const { history } = useHistory();
  const recent = history.slice(0, 4);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center pt-3 pb-6">
          <View className="w-10 h-10 rounded-2xl bg-primary items-center justify-center mr-3">
            <ScanLine size={20} color={COLORS.black} strokeWidth={ICON_STROKE} />
          </View>
          <Text className="font-title text-lg text-dark">QR Toolkit</Text>
        </View>

        <Text
          className="font-display text-[34px] leading-[40px] text-dark mb-2"
          accessibilityRole="header"
        >
          Scan or create{'\n'}a QR code.
        </Text>
        <Text className="text-[16px] leading-[23px] text-muted mb-7">
          Works offline. Nothing leaves your phone.
        </Text>

        {/* Scan is the main job, so it gets the larger tile. */}
        <View className="flex-row mb-9" style={{ height: 196 }}>
          <Pressable
            onPress={() => router.push('/(tabs)/scan')}
            accessibilityRole="button"
            accessibilityLabel="Scan a QR code"
            className="flex-[1.35] bg-primary rounded-3xl p-5 justify-between mr-3"
            style={({ pressed }) => ({
              boxShadow: SHADOW.lifted,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <View className="w-12 h-12 rounded-full bg-dark items-center justify-center">
              <ScanLine size={24} color={COLORS.primary} strokeWidth={ICON_STROKE} />
            </View>
            <View>
              <Text className="font-display text-[26px] leading-[30px] text-dark">Scan</Text>
              <Text className="text-[15px] text-dark mt-0.5">Point your camera</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(tabs)/generate')}
            accessibilityRole="button"
            accessibilityLabel="Create a QR code"
            className="flex-1 bg-white rounded-3xl p-5 justify-between"
            style={({ pressed }) => ({
              boxShadow: SHADOW.soft,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <View className="w-12 h-12 rounded-full bg-primary-pastel items-center justify-center">
              <SquarePlus size={22} color={COLORS.black} strokeWidth={ICON_STROKE} />
            </View>
            <View>
              <Text className="font-display text-[22px] leading-[26px] text-dark">Create</Text>
              <Text className="text-[15px] text-muted mt-0.5">Text, link, WiFi</Text>
            </View>
          </Pressable>
        </View>

        <View className="flex-row items-center justify-between mb-3">
          <Text className="font-title text-xl text-dark" accessibilityRole="header">
            Recent
          </Text>
          {history.length > 0 && (
            <Pressable
              onPress={() => router.push('/(tabs)/history')}
              accessibilityRole="link"
              className="flex-row items-center h-11 pl-3"
            >
              <Text className="font-body-semibold text-[15px] text-dark mr-1">See all</Text>
              <ArrowUpRight size={16} color={COLORS.black} strokeWidth={ICON_STROKE} />
            </Pressable>
          )}
        </View>

        {recent.length === 0 ? (
          <View className="bg-white rounded-3xl" style={{ boxShadow: SHADOW.soft }}>
            <EmptyState
              compact
              title="Nothing here yet"
              description="Codes you scan or create will show up here."
            />
          </View>
        ) : (
          <HistoryGroup>
            {recent.map((item) => (
              <HistoryItem
                key={item.id}
                item={item}
                onPress={() =>
                  router.push({ pathname: '/(tabs)/history', params: { id: item.id } })
                }
              />
            ))}
          </HistoryGroup>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
