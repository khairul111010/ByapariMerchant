import React from 'react';
import type { SellScreenName } from '../../store/jump';
import { CartsScreen } from '../carts/CartsScreen';
import { CouponsScreen } from '../coupons/CouponsScreen';
import { CustomersScreen } from '../customers/CustomersScreen';
import { LandingScreen } from '../landing/LandingScreen';
import { PosScreen } from '../pos/PosScreen';
import { ReviewsScreen } from '../reviews/ReviewsScreen';
import { ZonesScreen } from '../zones/ZonesScreen';

/** The selling tools, opened from More (and the counter sale also from Home and the "+" sheet). */
export function SellScreen({
  name,
  onBack,
}: {
  name: SellScreenName;
  onBack: () => void;
}) {
  switch (name) {
    case 'pos':
      return <PosScreen onBack={onBack} />;
    case 'customers':
      return <CustomersScreen onBack={onBack} />;
    case 'carts':
      return <CartsScreen onBack={onBack} />;
    case 'reviews':
      return <ReviewsScreen onBack={onBack} />;
    case 'coupons':
      return <CouponsScreen onBack={onBack} />;
    case 'zones':
      return <ZonesScreen onBack={onBack} />;
    case 'landing':
      return <LandingScreen onBack={onBack} />;
  }
}
