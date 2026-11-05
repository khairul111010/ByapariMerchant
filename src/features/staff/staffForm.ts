import type { TFunction } from 'i18next';
import { z } from 'zod';

const base = (t: TFunction) => ({
  name: z.string().trim().min(1, t('staff.nameRequired')),
  email: z.string().trim().email(t('login.invalidEmail')),
  role: z.enum(['owner', 'staff']),
});

// Courtesy only: the server also enforces its own password rules and uniqueness within the store.
export const makeCreateStaffSchema = (t: TFunction) =>
  z
    .object({
      ...base(t),
      password: z.string().min(8, t('staff.passwordShort')),
      password_confirmation: z.string(),
    })
    .refine(v => v.password === v.password_confirmation, {
      path: ['password_confirmation'],
      message: t('signup.passwordMismatch'),
    });

/** A blank password on edit means "keep the current one". */
export const makeEditStaffSchema = (t: TFunction) =>
  z
    .object({
      ...base(t),
      password: z.string(),
      password_confirmation: z.string(),
    })
    .superRefine((v, ctx) => {
      if (v.password !== '' && v.password.length < 8) {
        ctx.addIssue({
          code: 'custom',
          path: ['password'],
          message: t('staff.passwordShort'),
        });
      }
      if (v.password !== v.password_confirmation) {
        ctx.addIssue({
          code: 'custom',
          path: ['password_confirmation'],
          message: t('signup.passwordMismatch'),
        });
      }
    });

export type CreateStaffForm = z.infer<ReturnType<typeof makeCreateStaffSchema>>;
export type EditStaffForm = z.infer<ReturnType<typeof makeEditStaffSchema>>;

export const toCreateStaffPayload = (v: CreateStaffForm) => ({
  name: v.name.trim(),
  email: v.email.trim(),
  password: v.password,
  password_confirmation: v.password_confirmation,
  role: v.role,
});

/** Name, email and role are sent every time; the password only when one was typed. */
export function toEditStaffPayload(v: EditStaffForm) {
  const body: Record<string, string> = {
    name: v.name.trim(),
    email: v.email.trim(),
    role: v.role,
  };
  if (v.password !== '') {
    body.password = v.password;
    body.password_confirmation = v.password_confirmation;
  }
  return body;
}

/** Setting a password signs that person out of every phone, so warn before saving it. */
export const willSignOut = (v: Pick<EditStaffForm, 'password'>): boolean =>
  v.password !== '';
