import LoadingSplash from '@/components/LoadingSplash';
import { useQuranStore } from '@/store/useQuranStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import '../global.css';


export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore */
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Amiri': require('../assets/fonts/Amiri-Regular.ttf'),
    'Amiri-Bold': require('../assets/fonts/Amiri-Bold.ttf'),
    ...FontAwesome.font,
  });

  const [isStoreInitialized, setIsStoreInitialized] = useState(false);
  const navigationState = useRootNavigationState();
  const isNavReady = !!navigationState?.key;

  const {
    initialize: initializeStore,
    hasSeenIntro
  } = useQuranStore();

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    async function prepare() {
      try {
        await initializeStore();
      } catch (e) {
        console.warn(e);
      } finally {
        setIsStoreInitialized(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (loaded && isStoreInitialized && isNavReady) {
      await SplashScreen.hideAsync().catch(() => { });
    }
  }, [loaded, isStoreInitialized, isNavReady]);

  // Safety fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => { });
    }, 7000);
    return () => clearTimeout(timer);
  }, []);

  if (!loaded || !isStoreInitialized) {
    return <LoadingSplash />;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <RootLayoutNav isNavReady={isNavReady} hasSeenIntro={hasSeenIntro} />
    </View>
  );
}

function RootLayoutNav({ isNavReady, hasSeenIntro }: { isNavReady: boolean; hasSeenIntro: boolean }) {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isNavReady) return;

    const inIntroGroup = segments[0] === 'intro';

    if (!hasSeenIntro && !inIntroGroup) {
      router.replace('/intro');
    } else if (hasSeenIntro && inIntroGroup) {
      router.replace('/(tabs)');
    }
  }, [isNavReady, hasSeenIntro, segments]);

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack>
        <Stack.Screen name="intro" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="surah/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="profile" options={{ presentation: 'transparentModal', animation: 'fade', headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
