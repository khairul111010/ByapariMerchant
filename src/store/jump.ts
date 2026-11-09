import { create } from 'zustand';
import type { OrderStatus } from '../api/schemas/orders';
import { onSessionWipe } from './session';

export type SellScreenName =
  | 'pos'
  | 'customers'
  | 'carts'
  | 'reviews'
  | 'coupons'
  | 'zones'
  | 'landing';

/** A screen to open in another tab: from Home tiles, the "+" sheet or the setup checklist. */
export type JumpTarget =
  | { tab: 'Orders'; status?: OrderStatus }
  | { tab: 'Products'; screen: 'create' | 'scan' | 'low' | 'list' }
  | {
      tab: 'More';
      screen:
        | { sell: SellScreenName }
        | 'storefront'
        | 'appearance'
        | 'settings'
        | 'payments'
        | 'general';
    };

interface JumpState {
  target: JumpTarget | null;
  go: (t: JumpTarget) => void;
  clear: () => void;
}

/** Set by whoever asks; the shell switches tab, and that tab consumes it and opens the screen. */
export const useJump = create<JumpState>(set => ({
  target: null,
  go: target => set({ target }),
  clear: () => set({ target: null }),
}));

onSessionWipe(() => useJump.getState().clear());
