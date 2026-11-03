import { parsePush } from '../src/features/push/payload';
import { usePendingOrder } from '../src/store/pendingOrder';
import { useSession } from '../src/store/session';

describe('parsePush', () => {
  it('parses a new_order payload (ids arrive as strings)', () => {
    expect(parsePush({ type: 'new_order', order_id: '42', order_number: 'ORD-000123' })).toEqual({
      type: 'new_order',
      orderId: 42,
    });
  });
  it.each([
    [undefined],
    [null],
    [{}],
    [{ type: 'payment_received', order_id: '1' }],
    [{ type: 'new_order' }],
    [{ type: 'new_order', order_id: 'abc' }],
    [{ type: 'new_order', order_id: '0' }],
    [{ type: 'new_order', order_id: '1.5' }],
  ])('ignores %j without crashing', (data) => {
    expect(parsePush(data as never)).toBeNull();
  });
});

describe('pending order', () => {
  it('is cleared on logout so it cannot leak to the next login', async () => {
    usePendingOrder.getState().open(7);
    await useSession.getState().signOut();
    expect(usePendingOrder.getState().orderId).toBeNull();
  });
});
