import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Scan, PlusSquare, History } from 'lucide-react-native';
import { ToastHost } from '../../components/Toast';
import { COLORS } from '../../constants/theme';

const TAB_BAR_HEIGHT = 64;

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.gray,
          tabBarStyle: {
            backgroundColor: COLORS.white,
            borderTopWidth: 1,
            borderTopColor: '#F3F4F6',
            height: TAB_BAR_HEIGHT + insets.bottom,
            paddingBottom: 8 + insets.bottom,
            paddingTop: 8,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: 'Scan',
            tabBarIcon: ({ color, size }) => <Scan size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="generate"
          options={{
            title: 'Generate',
            tabBarIcon: ({ color, size }) => <PlusSquare size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color, size }) => <History size={size} color={color} />,
          }}
        />
      </Tabs>
      <ToastHost bottomOffset={TAB_BAR_HEIGHT + insets.bottom + 16} />
    </View>
  );
}
