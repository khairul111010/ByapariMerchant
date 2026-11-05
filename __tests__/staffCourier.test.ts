import { couriersEnvelopeSchema } from '../src/api/schemas/settings';
import { courierPatch, secretNames } from '../src/features/couriers/patch';
import {
  makeCreateStaffSchema, makeEditStaffSchema, toCreateStaffPayload, toEditStaffPayload, willSignOut,
} from '../src/features/staff/staffForm';
import { settingsSamples as s } from '../test/samples-settings';

const t = ((k: string) => k) as never;
const couriers = couriersEnvelopeSchema.parse(s['Couriers (Growth: all three allowed)']).data;
const pathao = couriers.find((c) => c.driver === 'pathao')!;
const steadfast = couriers.find((c) => c.driver === 'steadfast')!;

describe('staff forms', () => {
  const create = { name: ' Rina Das ', email: ' rina@example.com ', password: 'good-password', password_confirmation: 'good-password', role: 'staff' as const };
  it('create: accepts the real sample body, trims, and requires 8+ matching characters', () => {
    expect(makeCreateStaffSchema(t).safeParse(create).success).toBe(true);
    expect(toCreateStaffPayload(create)).toMatchObject({ name: 'Rina Das', email: 'rina@example.com', role: 'staff' });
    expect(makeCreateStaffSchema(t).safeParse({ ...create, password: 'x', password_confirmation: 'x' }).success).toBe(false);
    expect(makeCreateStaffSchema(t).safeParse({ ...create, password_confirmation: 'other' }).success).toBe(false);
    expect(makeCreateStaffSchema(t).safeParse({ ...create, role: 'admin' }).success).toBe(false);
  });
  it('edit: a blank password keeps the old one and is not sent', () => {
    const v = { name: 'Rina D.', email: 'rina@example.com', role: 'staff' as const, password: '', password_confirmation: '' };
    expect(makeEditStaffSchema(t).safeParse(v).success).toBe(true);
    expect(toEditStaffPayload(v)).toEqual({ name: 'Rina D.', email: 'rina@example.com', role: 'staff' });
    expect(willSignOut(v)).toBe(false);
  });
  it('edit: a new password must be 8+ and confirmed, and signs that person out', () => {
    const v = { name: 'R', email: 'r@x.com', role: 'staff' as const, password: 'newpassword', password_confirmation: 'newpassword' };
    expect(makeEditStaffSchema(t).safeParse(v).success).toBe(true);
    expect(toEditStaffPayload(v)).toMatchObject({ password: 'newpassword', password_confirmation: 'newpassword' });
    expect(willSignOut(v)).toBe(true);
    expect(makeEditStaffSchema(t).safeParse({ ...v, password: 'short', password_confirmation: 'short' }).success).toBe(false);
    expect(makeEditStaffSchema(t).safeParse({ ...v, password_confirmation: 'nope' }).success).toBe(false);
  });
});

describe('courier patch', () => {
  it('sends only the changed field, and no secret when none was typed', () => {
    expect(courierPatch(pathao, { pathao_client_id: 'cid-789' }, {})).toEqual({ pathao_client_id: 'cid-789' });
  });
  it('an untouched driver sends nothing', () => {
    expect(courierPatch(steadfast, {}, { steadfast_secret_key: '   ' })).toEqual({});
  });
  it('a typed secret is added, and a blank one is not', () => {
    expect(courierPatch(steadfast, {}, { steadfast_secret_key: ' sf-secret ' })).toEqual({ steadfast_secret_key: 'sf-secret' });
    expect(courierPatch(pathao, {}, { pathao_password: 'pw', pathao_client_secret: '' })).toEqual({ pathao_password: 'pw' });
  });
  it('never includes keys from another driver', () => {
    const patch = courierPatch(pathao, { pathao_client_id: 'x', steadfast_api_key: 'leak' }, {});
    expect(Object.keys(patch)).toEqual(['pathao_client_id']);
  });
  it('lists the driver\'s own secrets for the clear call', () => {
    expect(secretNames(pathao).sort()).toEqual(['pathao_client_secret', 'pathao_password']);
  });
});
