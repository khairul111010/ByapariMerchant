export const CENTRAL_DOMAIN = 'byapari.shop';
export const CENTRAL_API_BASE_URL = `https://${CENTRAL_DOMAIN}/api/v1`;

export const storeApiBaseUrl = (subdomain: string): string =>
  `https://${subdomain.trim().toLowerCase()}.${CENTRAL_DOMAIN}/api/v1`;
