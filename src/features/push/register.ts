import { Platform } from 'react-native';
import { z } from 'zod';
import { api } from '../../api/instance';
import { version } from '../../../package.json';

const deviceName = (): string => {
  const model = (Platform.constants as { Model?: string }).Model;
  return model ? `${model}` : 'Android';
};

/** Idempotent: safe on every launch and token rotation. */
export const registerDevice = (token: string) =>
  api.post('/devices', {
    body: { token, platform: Platform.OS === 'ios' ? 'ios' : 'android', device_name: deviceName(), app_version: version },
    schema: z.unknown(),
  });

export const unregisterDevice = (token: string) =>
  api.delete('/devices', { body: { token }, schema: z.unknown() });
