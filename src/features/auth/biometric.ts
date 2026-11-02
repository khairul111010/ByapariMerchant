import ReactNativeBiometrics from 'react-native-biometrics';

const rnb = new ReactNativeBiometrics();

export async function isBiometricAvailable(): Promise<boolean> {
  try {
    const { available } = await rnb.isSensorAvailable();
    return available;
  } catch {
    return false;
  }
}

export async function authenticate(promptMessage: string): Promise<boolean> {
  try {
    const { success } = await rnb.simplePrompt({ promptMessage });
    return success;
  } catch {
    return false;
  }
}
