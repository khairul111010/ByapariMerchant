import { z } from 'zod';
import { api } from '../../api/instance';
import { meSchema, sessionPayloadSchema } from '../../api/schemas/auth';
import { storeApiBaseUrl } from '../../config';

const DEVICE_NAME = 'Bypari Merchant app';

export const login = (shopAddress: string, email: string, password: string) =>
  api.post('/auth/login', {
    baseUrl: storeApiBaseUrl(shopAddress),
    anonymous: true,
    body: { email, password, device_name: DEVICE_NAME },
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

export const logoutRequest = () => api.post('/auth/logout', { schema: z.unknown() });
