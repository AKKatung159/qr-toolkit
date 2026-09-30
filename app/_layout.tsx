import '../global.css';
import { LogBox } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from '../components/Toast';
import { COLORS } from '../constants/theme';
import { HistoryProvider } from '../hooks/useHistory';

// Emitted by NativeWind's css-interop runtime under Reanimated 4, not by app code.
LogBox.ignoreLogs(["It looks like you might be using shared value's .value inside reanimated"]);

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <HistoryProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: COLORS.background },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </HistoryProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
