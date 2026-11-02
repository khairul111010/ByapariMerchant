import { makeSignupSchema, normalizeWhatsapp } from '../src/features/auth/signupSchema';

const t = ((k: string) => k) as never;
const schema = makeSignupSchema(t);

const valid = {
  plan: 'starter',
  store_name: 'My Shop',
  subdomain: 'myshop',
  category: 'fashion',
  owner_name: 'Rahim',
  owner_email: 'rahim@example.com',
  owner_password: 'secret-pass',
  owner_password_confirmation: 'secret-pass',
  whatsapp_number: '',
};

const firstError = (input: object) => {
  const r = schema.safeParse(input);
  return r.success ? null : { path: r.error.issues[0].path[0], message: r.error.issues[0].message };
};

describe('signup schema', () => {
  it('accepts a valid form', () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });
  it('rejects mismatched passwords on the confirmation field', () => {
    expect(firstError({ ...valid, owner_password_confirmation: 'x' })).toEqual({
      path: 'owner_password_confirmation',
      message: 'signup.passwordMismatch',
    });
  });
  it('rejects a bad subdomain', () => {
    expect(firstError({ ...valid, subdomain: '-bad-' })?.path).toBe('subdomain');
    expect(firstError({ ...valid, subdomain: 'has space' })?.path).toBe('subdomain');
  });
  it('whatsapp is optional but validated, ignoring spaces and dashes', () => {
    expect(schema.safeParse({ ...valid, whatsapp_number: '017 1234-5678' }).success).toBe(true);
    expect(firstError({ ...valid, whatsapp_number: '12345' })?.path).toBe('whatsapp_number');
    expect(normalizeWhatsapp('017 1234-5678')).toBe('01712345678');
  });
  it('requires plan and category', () => {
    expect(firstError({ ...valid, plan: '' })?.path).toBe('plan');
    expect(firstError({ ...valid, category: '' })?.path).toBe('category');
  });
});
