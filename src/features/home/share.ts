import Share from 'react-native-share';
import type { TFunction } from 'i18next';
import type { Store } from '../../api/schemas/auth';
import { storefrontLink } from './logic';

/**
 * Opens the share sheet with the shop link (Facebook, WhatsApp, Messenger...). Returns false when
 * there is no link to share yet. Cancelling the sheet is not an error.
 */
export async function shareShop(store: Store | undefined, t: TFunction): Promise<boolean> {
  const url = storefrontLink(store);
  if (!url) {
    return false;
  }
  try {
    await Share.open({ message: t('home.shareMessage', { shop: store?.name ?? '', url }), failOnCancel: false });
  } catch {
    // dismissed
  }
  return true;
}
