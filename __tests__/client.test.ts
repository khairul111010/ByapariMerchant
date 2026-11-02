import { z } from 'zod';
import { createApiClient } from '../src/api/client';
import { ApiError } from '../src/api/errors';

const respond = (status: number, body?: unknown) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body === undefined ? '' : JSON.stringify(body)),
  } as Response);

function setup(fetchImpl: jest.Mock, token: string | null = 'tok') {
  const onUnauthorized = jest.fn();
  const onSuspended = jest.fn();
  const client = createApiClient({
    centralBaseUrl: 'https://byapari.shop/api/v1',
    getStoreBaseUrl: () => 'https://shop.byapari.shop/api/v1',
    getToken: () => token,
    onUnauthorized,
    onSuspended,
    fetchImpl: fetchImpl as unknown as typeof fetch,
  });
  return { client, onUnauthorized, onSuspended };
}

describe('api client', () => {
  it('sends Accept + bearer to the store host with query', async () => {
    const f = jest.fn(() => respond(200, { data: [] }));
    const { client } = setup(f);
    await client.get('/orders', { query: { status: 'pending', q: '' } });
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://shop.byapari.shop/api/v1/orders?status=pending');
    expect((init.headers as Record<string, string>).Accept).toBe(
      'application/json',
    );
    expect((init.headers as Record<string, string>).Authorization).toBe(
      'Bearer tok',
    );
  });

  it('uses the central host and no token for anonymous signup calls', async () => {
    const f = jest.fn(() => respond(200, {}));
    const { client } = setup(f);
    await client.get('/signup/options', { central: true, anonymous: true });
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://byapari.shop/api/v1/signup/options');
    expect(
      (init.headers as Record<string, string>).Authorization,
    ).toBeUndefined();
  });

  it('honours an explicit baseUrl (login before a session exists)', async () => {
    const f = jest.fn(() => respond(200, {}));
    const { client } = setup(f);
    await client.post('/auth/login', {
      baseUrl: 'https://other.byapari.shop/api/v1',
      anonymous: true,
      body: {},
    });
    expect((f.mock.calls[0] as unknown as [string])[0]).toBe(
      'https://other.byapari.shop/api/v1/auth/login',
    );
  });

  it('calls onUnauthorized on 401 for authenticated calls only', async () => {
    const f = jest.fn(() => respond(401, { message: 'x' }));
    const { client, onUnauthorized } = setup(f);
    await expect(client.get('/me')).rejects.toMatchObject({
      kind: 'unauthenticated',
    });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);

    await expect(
      client.post('/auth/login', { anonymous: true, body: {} }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('flags a suspended store', async () => {
    const f = jest.fn(() => respond(503, { code: 'store_suspended' }));
    const { client, onSuspended } = setup(f);
    await expect(client.get('/me')).rejects.toMatchObject({
      kind: 'store_suspended',
    });
    expect(onSuspended).toHaveBeenCalled();
  });

  it('maps a fetch failure to a network error', async () => {
    const f = jest.fn(() => Promise.reject(new TypeError('offline')));
    const { client } = setup(f);
    await expect(client.get('/me')).rejects.toMatchObject({ kind: 'network' });
  });

  it('rejects responses that fail zod validation', async () => {
    const f = jest.fn(() => respond(200, { unread: 'nope' }));
    const { client } = setup(f);
    await expect(
      client.get('/notifications', { schema: z.object({ unread: z.number() }) }),
    ).rejects.toMatchObject({ kind: 'invalid_response' });
  });

  it('keeps money as strings through validation', async () => {
    const f = jest.fn(() => respond(200, { total: '1560.00' }));
    const { client } = setup(f);
    const r = await client.get('/x', {
      schema: z.object({ total: z.string() }),
    });
    expect(r.total).toBe('1560.00');
  });
});
