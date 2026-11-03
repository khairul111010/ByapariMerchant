import { create } from 'zustand';
import { onSessionWipe } from './session';

/** An order opened from a push tap, held until the UI is ready to show it. */
interface PendingOrderState {
  orderId: number | null;
  open: (orderId: number) => void;
  clear: () => void;
}

export const usePendingOrder = create<PendingOrderState>((set) => ({
  orderId: null,
  open: (orderId) => set({ orderId }),
  clear: () => set({ orderId: null }),
}));

onSessionWipe(() => usePendingOrder.getState().clear());
