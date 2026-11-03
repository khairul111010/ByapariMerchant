import { z } from 'zod';
import { createApiClient } from '../src/api/client';

class FakeXhr {
  static last: FakeXhr;
  upload: { onprogress?: (e: { lengthComputable: boolean; loaded: number; total: number }) => void } = {};
  headers: Record<string, string> = {};
  status = 0;
  responseText = '';
  url = '';
  onload?: () => void;
  onerror?: () => void;
  onabort?: () => void;
  ontimeout?: () => void;
  constructor() {
    FakeXhr.last = this;
  }
  open(_m: string, url: string) { this.url = url; }
  setRequestHeader(k: string, v: string) { this.headers[k] = v; }
  send() {}
  abort() { this.onabort?.(); }
  finish(status: number, body: unknown) {
    this.status = status;
    this.responseText = JSON.stringify(body);
    this.onload?.();
  }
}

function setup() {
  const onUnauthorized = jest.fn();
  const client = createApiClient({
    centralBaseUrl: 'https://byapari.shop/api/v1',
    getStoreBaseUrl: () => 'https://shop.byapari.shop/api/v1',
    getToken: () => 'tok',
    onUnauthorized,
    onSuspended: jest.fn(),
    xhrImpl: FakeXhr as unknown as new () => XMLHttpRequest,
  });
  return { client, onUnauthorized };
}
const schema = z.object({ data: z.object({ id: z.number() }) });

describe('client.upload', () => {
  it('posts to the store host with auth and reports progress', async () => {
    const { client } = setup();
    const progress: number[] = [];
    const p = client.upload('/products/1/images', new FormData(), { schema, onProgress: (f) => progress.push(f) });
    FakeXhr.last.upload.onprogress?.({ lengthComputable: true, loaded: 50, total: 200 });
    FakeXhr.last.finish(201, { data: { id: 9 } });
    await expect(p).resolves.toEqual({ data: { id: 9 } });
    expect(FakeXhr.last.url).toBe('https://shop.byapari.shop/api/v1/products/1/images');
    expect(FakeXhr.last.headers.Authorization).toBe('Bearer tok');
    expect(progress).toEqual([0.25]);
  });
  it('maps server refusals through the central mapper', async () => {
    const { client } = setup();
    const p = client.upload('/x', new FormData(), { schema });
    FakeXhr.last.finish(422, { message: 'bad', errors: { image: ['too big'] } });
    await expect(p).rejects.toMatchObject({ kind: 'validation' });
  });
  it('signs out on 401', async () => {
    const { client, onUnauthorized } = setup();
    const p = client.upload('/x', new FormData(), { schema });
    FakeXhr.last.finish(401, {});
    await expect(p).rejects.toMatchObject({ kind: 'unauthenticated' });
    expect(onUnauthorized).toHaveBeenCalled();
  });
  it('maps connection failures to a network error', async () => {
    const { client } = setup();
    const p = client.upload('/x', new FormData(), { schema });
    FakeXhr.last.onerror?.();
    await expect(p).rejects.toMatchObject({ kind: 'network' });
  });
  it('rejects an unexpected response body', async () => {
    const { client } = setup();
    const p = client.upload('/x', new FormData(), { schema });
    FakeXhr.last.finish(201, { nope: true });
    await expect(p).rejects.toMatchObject({ kind: 'invalid_response' });
  });
});
