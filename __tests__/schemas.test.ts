import { sessionPayloadSchema } from '../src/api/schemas/auth';
import { orderEnvelopeSchema, ordersPageSchema } from '../src/api/schemas/orders';
import { loginSample, orderDetailSample, ordersSample } from '../test/samples';

describe('schemas accept the real backend samples', () => {
  it('login', () => {
    expect(sessionPayloadSchema.safeParse(loginSample).success).toBe(true);
  });
  it('orders list', () => {
    expect(ordersPageSchema.safeParse(ordersSample).success).toBe(true);
  });
  it('order detail', () => {
    expect(orderEnvelopeSchema.safeParse(orderDetailSample).success).toBe(true);
  });
  it('keeps money as strings', () => {
    const r = orderEnvelopeSchema.parse(orderDetailSample);
    expect(r.data.total).toBe('1560.00');
  });
  it('rejects an unknown status so a server change is noticed', () => {
    const bad = { ...ordersSample, data: [{ ...ordersSample.data[0], status: 'weird' }] };
    expect(ordersPageSchema.safeParse(bad).success).toBe(false);
  });
});

import { bkashPending, booked, withAdvance } from '../test/samples-payments';

describe('payment and courier samples', () => {
  it.each([
    ['pending bKash', bkashPending],
    ['advance payment', withAdvance],
    ['booked courier', booked],
  ])('%s', (_n, sample) => {
    expect(orderEnvelopeSchema.safeParse(sample).success).toBe(true);
  });
  it('keeps the free-form courier status as-is', () => {
    expect(orderEnvelopeSchema.parse(booked).data.courier.booking?.status).toBe('in_review');
  });
});


describe('a phone-only owner', () => {
  it('logs in with no email: the user carries a phone and a null email', () => {
    const phoneOnly = { ...loginSample, user: { ...loginSample.user, email: null, phone: '01712345678' } };
    const r = sessionPayloadSchema.parse(phoneOnly);
    expect(r.user.email).toBeNull();
    expect(r.user.phone).toBe('01712345678');
  });
  it('still accepts the older reply without a phone key', () => {
    expect(sessionPayloadSchema.safeParse(loginSample).success).toBe(true);
  });
});
