import type { TFunction } from 'i18next';
import { z } from 'zod';
import { EMAIL_RE, normalizePhone, toAsciiDigits } from './contact';

export const SHOP_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i;
const WHATSAPP_RE = /^01\d{9}$/;

/** Server strips spaces and dashes from the WhatsApp number; do the same before checking. */
export const normalizeWhatsapp = (v: string): string =>
  toAsciiDigits(v).replace(/[\s-]/g, '');

// Only courtesy checks. Rules like password strength are left to the server's
// 422 messages so the app never rejects something the server would accept.
export const makeSignupSchema = (t: TFunction) =>
  z
    .object({
      plan: z.string().min(1, t('signup.pickPlan')),
      store_name: z.string().trim().min(1, t('signup.storeNameRequired')),
      subdomain: z.string().trim().regex(SHOP_RE, t('login.invalidShop')),
      category: z.string().min(1, t('signup.pickCategory')),
      owner_name: z.string().trim().min(1, t('signup.ownerNameRequired')),
      // An owner may give an email, a phone, or both, but at least one (checked below).
      owner_email: z
        .string()
        .trim()
        .refine(v => v === '' || EMAIL_RE.test(v), t('login.invalidEmail')),
      owner_phone: z
        .string()
        .trim()
        .refine(
          v => v === '' || normalizePhone(v) !== null,
          t('signup.phoneInvalid'),
        ),
      owner_password: z.string().min(1, t('login.passwordRequired')),
      owner_password_confirmation: z.string(),
      whatsapp_number: z
        .string()
        .refine(
          v => v === '' || WHATSAPP_RE.test(normalizeWhatsapp(v)),
          t('signup.whatsappInvalid'),
        ),
    })
    .refine(v => v.owner_email !== '' || v.owner_phone !== '', {
      path: ['owner_phone'],
      message: t('signup.contactRequired'),
    })
    .refine(v => v.owner_password === v.owner_password_confirmation, {
      path: ['owner_password_confirmation'],
      message: t('signup.passwordMismatch'),
    });

export type SignupForm = z.infer<ReturnType<typeof makeSignupSchema>>;

export const STEP_FIELDS: Array<Array<keyof SignupForm>> = [
  ['plan'],
  ['store_name', 'subdomain', 'category'],
  [
    'owner_name',
    'owner_email',
    'owner_phone',
    'owner_password',
    'owner_password_confirmation',
    'whatsapp_number',
  ],
];

/**
 * The signup request: the owner's email and phone are sent only when given (never as empty
 * strings), the phone as the server stores it (01XXXXXXXXX).
 */
export function toSignupPayload(v: SignupForm) {
  const phone =
    v.owner_phone.trim() === ''
      ? undefined
      : normalizePhone(v.owner_phone) ?? undefined;
  return {
    plan: v.plan,
    store_name: v.store_name.trim(),
    subdomain: v.subdomain.trim().toLowerCase(),
    category: v.category,
    owner_name: v.owner_name.trim(),
    owner_email: v.owner_email.trim() === '' ? undefined : v.owner_email.trim(),
    owner_phone: phone,
    owner_password: v.owner_password,
    owner_password_confirmation: v.owner_password_confirmation,
    whatsapp_number: normalizeWhatsapp(v.whatsapp_number) || undefined,
  };
}
