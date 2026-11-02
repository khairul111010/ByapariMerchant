import { mapError } from '../src/api/errors';

describe('mapError', () => {
  it.each([
    [401, {}, 'unauthenticated'],
    [403, {}, 'forbidden'],
    [403, { code: 'staff_limit_reached' }, 'plan_gate'],
    [403, { code: 'driver_not_in_plan' }, 'plan_gate'],
    [403, { code: 'custom_domain_not_in_plan' }, 'plan_gate'],
    [404, {}, 'not_found'],
    [409, { code: 'stock_changed' }, 'conflict'],
    [422, { errors: { email: ['bad'] } }, 'validation'],
    [422, { code: 'order_pending' }, 'business_refusal'],
    [429, {}, 'throttled'],
    [503, { code: 'store_suspended' }, 'store_suspended'],
    [500, {}, 'server'],
    [503, {}, 'server'],
  ])('%i %j -> %s', (status, body, kind) => {
    expect(mapError(status, body).kind).toBe(kind);
  });

  it('keeps field errors and extra server fields', () => {
    const e = mapError(409, {
      code: 'stock_changed',
      stock_quantity: 7,
      message: 'moved',
    });
    expect(e.code).toBe('stock_changed');
    expect(e.extra.stock_quantity).toBe(7);
    expect(e.message).toBe('moved');
  });
});
