import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import './src/i18n';
import { hasChosenLanguage } from './src/i18n';
import { persister, queryClient } from './src/app/queryClient';
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
import { useLock } from './src/store/lock';
import { useSession } from './src/store/session';
import { colors } from './src/ui/theme';

initTelemetry();

type AuthStep = 'language' | 'login' | 'forgot' | 'signup';

function SignedOut() {
  const [step, setStep] = useState<AuthStep>(hasChosenLanguage() ? 'login' : 'language');
  if (step === 'language') {
    return <LanguageScreen onDone={() => setStep('login')} />;
  }
  if (step === 'forgot') {
    return <ForgotPasswordScreen onBack={() => setStep('login')} />;
  }
  if (step === 'signup') {
    return <SignupScreen onBackToLogin={() => setStep('login')} />;
  }
  return <LoginScreen onForgot={() => setStep('forgot')} onSignup={() => setStep('signup')} />;
}

function SignedIn() {
  useMe(); // refresh /me on launch
  useAppLock();
  const locked = useLock((s) => s.locked);
  const suspended = useSession((s) => s.storeSuspended);
  if (locked) {
    return <LockScreen />;
  }
  return suspended ? <SuspendedScreen /> : <NavigationContainer><MainTabs /></NavigationContainer>;
}

function Root() {
  const status = useSession((s) => s.status);
  const hydrate = useSession((s) => s.hydrate);
  useEffect(() => {
    void hydrate().then(() => {
      if (useSession.getState().status === 'signedIn') {
        useLock.getState().initForSignedIn();
      }
    });
  }, [hydrate]);

  if (status === 'booting') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  return status === 'signedIn' ? <SignedIn /> : <SignedOut />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
          <Root />
        </SafeAreaView>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
