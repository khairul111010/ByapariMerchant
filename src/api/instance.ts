import { CENTRAL_API_BASE_URL } from '../config';
import { useSession } from '../store/session';
import { createApiClient } from './client';

/** The one API client, wired to the session store. */
export const api = createApiClient({
  centralBaseUrl: CENTRAL_API_BASE_URL,
  getStoreBaseUrl: () => useSession.getState().apiBaseUrl,
  getToken: () => useSession.getState().token,
  onUnauthorized: () => {
    void useSession.getState().signOut();
  },
  onSuspended: () => useSession.getState().setSuspended(true),
});
