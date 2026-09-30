import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

interface ToastMessage {
  id: number;
  message: string;
}

interface ToastContextValue {
  toast: ToastMessage | null;
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
const TOAST_DURATION_MS = 1800;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: Date.now(), message });
    timer.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  return <ToastContext.Provider value={{ toast, showToast }}>{children}</ToastContext.Provider>;
}

export function useToast(): (message: string) => void {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }
  return context.showToast;
}

/**
 * Renders the current toast. Native <Modal>s draw above the root view,
 * so a modal that triggers toasts should render its own <ToastHost />.
 */
export function ToastHost({ bottomOffset = 88 }: { bottomOffset?: number }) {
  const context = useContext(ToastContext);
  const [opacity] = useState(() => new Animated.Value(0));
  const toast = context?.toast ?? null;

  useEffect(() => {
    if (!toast) return;
    opacity.setValue(0);
    Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  }, [toast, opacity]);

  if (!toast) return null;

  return (
    <View
      pointerEvents="none"
      className="absolute left-0 right-0 items-center px-6"
      style={{ bottom: bottomOffset }}
    >
      <Animated.View
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        className="flex-row items-center bg-dark rounded-full px-4 py-3"
        style={{
          opacity,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <CheckCircle2 size={18} color={COLORS.primary} />
        <Text className="text-white text-sm font-semibold ml-2">{toast.message}</Text>
      </Animated.View>
    </View>
  );
}
