import { z } from 'zod';
import { api } from '../../api/instance';
import { meSchema, sessionPayloadSchema } from '../../api/schemas/auth';
import { storeApiBaseUrl } from '../../config';

const DEVICE_NAME = 'Bypari Merchant app';

/** `loginId` is an email or a phone (normalised to 01XXXXXXXXX). The server also still accepts `email`. */
export const login = (shopAddress: string, loginId: string, password: string) =>
  api.post('/auth/login', {
    baseUrl: storeApiBaseUrl(shopAddress),
    anonymous: true,
    body: { login: loginId, password, device_name: DEVICE_NAME },
    schema: sessionPayloadSchema,
  });

export const forgotPassword = (shopAddress: string, email: string) =>
  api.post('/auth/forgot-password', {
    baseUrl: storeApiBaseUrl(shopAddress),
    anonymous: true,
    body: { email },
    schema: z.unknown(),
  });

export const fetchMe = () => api.get('/me', { schema: meSchema });

export const logoutRequest = () =>
  api.post('/auth/logout', { schema: z.unknown() });
