import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import {
  DefaultTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import './src/i18n';
import { hasChosenLanguage } from './src/i18n';
import { CACHE_BUSTER, persister, queryClient } from './src/app/queryClient';
import { ForgotPasswordScreen } from './src/features/auth/ForgotPasswordScreen';
import { LanguageScreen } from './src/features/auth/LanguageScreen';
import { LoginScreen } from './src/features/auth/LoginScreen';
import { SignupScreen } from './src/features/auth/SignupScreen';
import { LockScreen } from './src/features/auth/LockScreen';
import { useAppLock } from './src/features/auth/useAppLock';
import { useMe } from './src/features/auth/useMe';
import { MainTabs } from './src/features/shell/MainTabs';
import { SuspendedScreen } from './src/features/shell/SuspendedScreen';
import { initTelemetry } from './src/telemetry/crash';
import { useQueueSync } from './src/offline/useQueue';
import { usePush } from './src/features/push/usePush';
import { useLock } from './src/store/lock';
import { useSession } from './src/store/session';
import { colors } from './src/ui/theme';
import { ThemeProvider } from './src/ui/ThemeProvider';

initTelemetry();

type AuthStep = 'language' | 'login' | 'forgot' | 'signup';

function SignedOut() {
  const [step, setStep] = useState<AuthStep>(
    hasChosenLanguage() ? 'login' : 'language',
  );
  if (step === 'language') {
    return <LanguageScreen onDone={() => setStep('login')} />;
  }
  if (step === 'forgot') {
    return <ForgotPasswordScreen onBack={() => setStep('login')} />;
  }
  if (step === 'signup') {
    return <SignupScreen onBackToLogin={() => setStep('login')} />;
  }
  return (
    <LoginScreen
      onForgot={() => setStep('forgot')}
      onSignup={() => setStep('signup')}
    />
  );
}

function SignedIn() {
  useMe(); // refresh /me on launch
  useAppLock();
  usePush();
  useQueueSync();
  const locked = useLock(s => s.locked);
  const suspended = useSession(s => s.storeSuspended);
  if (locked) {
    return <LockScreen />;
  }
  return suspended ? (
    <SuspendedScreen />
  ) : (
    <NavigationContainer theme={navTheme}>
      <MainTabs />
    </NavigationContainer>
  );
}

// The page colour behind every screen, so short screens never show a grey strip.
const navTheme: Theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg },
};

function Root() {
  const status = useSession(s => s.status);
  const hydrate = useSession(s => s.hydrate);
  useEffect(() => {
    void hydrate().then(() => {
      if (useSession.getState().status === 'signedIn') {
        useLock.getState().initForSignedIn();
      }
    });
  }, [hydrate]);

  if (status === 'booting') {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  return status === 'signedIn' ? <SignedIn /> : <SignedOut />;
}

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister, buster: CACHE_BUSTER }}
        >
          <SafeAreaView style={styles.root}>
            <Root />
          </SafeAreaView>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  root: { flex: 1, backgroundColor: colors.bg },
});
