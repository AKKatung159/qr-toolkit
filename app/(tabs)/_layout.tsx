import { Pressable, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, ScanLine, SquarePlus, History, LucideIcon } from 'lucide-react-native';
import { ToastHost } from '../../components/Toast';
import { COLORS } from '../../constants/theme';
import { ICON_STROKE } from '../../constants/qrTypes';

const TAB_BAR_HEIGHT = 68;

/** Active tab sits in a pastel pill with a dark icon; orange-on-white icons would fail contrast. */
function TabIcon({ Icon, focused }: { Icon: LucideIcon; focused: boolean }) {
  return (
    <View
      className={`w-14 h-8 rounded-full items-center justify-center ${
        focused ? 'bg-primary-pastel' : ''
      }`}
    >
      <Icon size={22} color={focused ? COLORS.black : COLORS.gray} strokeWidth={ICON_STROKE} />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1">
      <Tabs
        screenOptions={{
          headerShown: false,
          // Plain Pressable: Android's default ripple draws a large grey circle over the bar.
          tabBarButton: ({
            children,
            style,
            onPress,
            onLongPress,
            accessibilityState,
            accessibilityLabel,
            testID,
          }) => (
            <Pressable
              onPress={onPress}
              onLongPress={onLongPress}
              style={style}
              accessibilityRole="tab"
              accessibilityState={accessibilityState}
              accessibilityLabel={accessibilityLabel}
              testID={testID}
            >
              {children}
            </Pressable>
          ),
          tabBarActiveTintColor: COLORS.black,
          tabBarInactiveTintColor: COLORS.gray,
          tabBarStyle: {
            backgroundColor: COLORS.white,
            borderTopWidth: 1,
            borderTopColor: COLORS.line,
            height: TAB_BAR_HEIGHT + insets.bottom,
            paddingBottom: 10 + insets.bottom,
            paddingTop: 8,
            elevation: 0,
          },
          tabBarLabelStyle: {
            fontFamily: 'Outfit_600SemiBold',
            fontSize: 12,
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => <TabIcon Icon={Home} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: 'Scan',
            tabBarIcon: ({ focused }) => <TabIcon Icon={ScanLine} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="generate"
          options={{
            title: 'Create',
            tabBarIcon: ({ focused }) => <TabIcon Icon={SquarePlus} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ focused }) => <TabIcon Icon={History} focused={focused} />,
          }}
        />
      </Tabs>
      <ToastHost bottomOffset={TAB_BAR_HEIGHT + insets.bottom + 16} />
    </View>
  );
}
