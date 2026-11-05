import { api } from '../../api/instance';
import { sessionPayloadSchema } from '../../api/schemas/auth';
import {
  signupOptionsSchema,
  subdomainAvailabilitySchema,
} from '../../api/schemas/signup';

export const fetchSignupOptions = () =>
  api.get('/signup/options', {
    central: true,
    anonymous: true,
    schema: signupOptionsSchema,
  });

export const checkSubdomain = (subdomain: string, signal?: AbortSignal) =>
  api.get('/signup/subdomain-availability', {
    central: true,
    anonymous: true,
    query: { subdomain },
    schema: subdomainAvailabilitySchema,
    signal,
  });

export interface SignupInput {
  plan: string;
  store_name: string;
  subdomain: string;
  category: string;
  owner_name: string;
  owner_email?: string;
  owner_phone?: string;
  owner_password: string;
  owner_password_confirmation: string;
  whatsapp_number?: string;
}

export const signup = (input: SignupInput) =>
  api.post('/signup', {
    central: true,
    anonymous: true,
    body: { ...input, device_name: 'Bypari Merchant app' },
    schema: sessionPayloadSchema,
  });
