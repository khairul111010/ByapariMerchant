import {
  makeSignupSchema,
  normalizeWhatsapp,
  toSignupPayload,
} from '../src/features/auth/signupSchema';

const t = ((k: string) => k) as never;
const schema = makeSignupSchema(t);

const valid = {
  plan: 'starter',
  store_name: 'My Shop',
  subdomain: 'myshop',
  category: 'fashion',
  owner_name: 'Rahim',
  owner_email: 'rahim@example.com',
  owner_phone: '',
  owner_password: 'secret-pass',
  owner_password_confirmation: 'secret-pass',
  whatsapp_number: '',
};

const firstError = (input: object) => {
  const r = schema.safeParse(input);
  return r.success
    ? null
    : { path: r.error.issues[0].path[0], message: r.error.issues[0].message };
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
    expect(firstError({ ...valid, subdomain: '-bad-' })?.path).toBe(
      'subdomain',
    );
    expect(firstError({ ...valid, subdomain: 'has space' })?.path).toBe(
      'subdomain',
    );
  });
  it('whatsapp is optional but validated, ignoring spaces and dashes', () => {
    expect(
      schema.safeParse({ ...valid, whatsapp_number: '017 1234-5678' }).success,
    ).toBe(true);
    expect(firstError({ ...valid, whatsapp_number: '12345' })?.path).toBe(
      'whatsapp_number',
    );
    expect(normalizeWhatsapp('017 1234-5678')).toBe('01712345678');
  });
  it('requires plan and category', () => {
    expect(firstError({ ...valid, plan: '' })?.path).toBe('plan');
    expect(firstError({ ...valid, category: '' })?.path).toBe('category');
  });
  it('accepts an email only, a phone only, or both', () => {
    expect(schema.safeParse(valid).success).toBe(true);
    expect(
      schema.safeParse({
        ...valid,
        owner_email: '',
        owner_phone: '+880 1712-345678',
      }).success,
    ).toBe(true);
    expect(
      schema.safeParse({ ...valid, owner_phone: '01712345678' }).success,
    ).toBe(true);
  });
  it('requires at least one of email or phone, and reports it on the phone field', () => {
    expect(firstError({ ...valid, owner_email: '', owner_phone: '' })).toEqual({
      path: 'owner_phone',
      message: 'signup.contactRequired',
    });
  });
  it('rejects a malformed email or phone', () => {
    expect(firstError({ ...valid, owner_email: 'nope' })?.path).toBe(
      'owner_email',
    );
    expect(firstError({ ...valid, owner_phone: '12345' })?.path).toBe(
      'owner_phone',
    );
  });
});

describe('signup payload', () => {
  const values = {
    ...valid,
    store_name: ' My Shop ',
    subdomain: ' MyShop ',
    owner_name: ' Rahim ',
    whatsapp_number: '017 1234-5678',
  };
  it('sends the email only when given and omits the empty phone', () => {
    const p = toSignupPayload(values);
    expect(p.owner_email).toBe('rahim@example.com');
    expect(p.owner_phone).toBeUndefined();
    expect(p).toMatchObject({
      store_name: 'My Shop',
      subdomain: 'myshop',
      owner_name: 'Rahim',
      whatsapp_number: '01712345678',
    });
  });
  it('sends a phone-only owner with the phone normalised and no email at all', () => {
    const p = toSignupPayload({
      ...values,
      owner_email: '',
      owner_phone: '+880 1712-345678',
    });
    expect(p.owner_phone).toBe('01712345678');
    expect(p.owner_email).toBeUndefined();
    expect(Object.keys(JSON.parse(JSON.stringify(p)))).not.toContain(
      'owner_email',
    );
  });
  it('turns Bangla digits into the number the server stores', () => {
    expect(
      toSignupPayload({
        ...values,
        owner_email: '',
        owner_phone: '০১৭১২৩৪৫৬৭৮',
      }).owner_phone,
    ).toBe('01712345678');
  });
});
