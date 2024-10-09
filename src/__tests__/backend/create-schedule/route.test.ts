```typescript
import { jest } from '@jest/globals';
import { NextApiRequest, NextApiResponse } from 'next';
import httpMocks from 'node-mocks-http';
import handler from '@/app/api/create-schedule.ts/route';

interface MockResponse extends NextApiResponse {
  _getStatusCode(): number;
  _getData(): string | object;
}

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ data: { id: 'new-schedule-id' }, error: null }),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),
    },
  })),
}));

describe('create-schedule API', () => {
  it('正常なリクエストでスケジュールが作成されること', async () => {
    const req = httpMocks.createRequest<NextApiRequest>({
      method: 'POST',
      body: {
        startTime: '2023-07-01T10:00:00Z',
        endTime: '2023-07-01T12:00:00Z',
        isFreeTime: true,
      },
      headers: {
        authorization: 'Bearer fake-token',
      },
    });
    const res = httpMocks.createResponse<MockResponse>();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toEqual({ id: 'new-schedule-id' });
  });

  it('認証エラーの場合、401エラーを返すこと', async () => {
    const req = httpMocks.createRequest<NextApiRequest>({
      method: 'POST',
      body: {
        startTime: '2023-07-01T10:00:00Z',
        endTime: '2023-07-01T12:00:00Z',
        isFreeTime: true,
      },
    });
    const res = httpMocks.createResponse<MockResponse>();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(res._getData()).toEqual({ error: '認証エラー' });
  });

  it('不正なリクエストボディの場合、400エラーを返すこと', async () => {
    const req = httpMocks.createRequest<NextApiRequest>({
      method: 'POST',
      body: {
        startTime: '2023-07-01T10:00:00Z',
      },
      headers: {
        authorization: 'Bearer fake-token',
      },
    });
    const res = httpMocks.createResponse<MockResponse>();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toEqual({ error: 'リクエストボディが不正です' });
  });

  it('データベースエラーの場合、500エラーを返すこと', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.mocked(createClient).mockReturnValueOnce({
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockRejectedValue(new Error('データベースエラー')),
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),
      },
    } as any);

    const req = httpMocks.createRequest<NextApiRequest>({
      method: 'POST',
      body: {
        startTime: '2023-07-01T10:00:00Z',
        endTime: '2023-07-01T12:00:00Z',
        isFreeTime: true,
      },
      headers: {
        authorization: 'Bearer fake-token',
      },
    });
    const res = httpMocks.createResponse<MockResponse>();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getData()).toEqual({ error: 'サーバーエラー' });
  });

  it('開始時間が終了時間より後の場合、400エラーを返すこと', async () => {
    const req = httpMocks.createRequest<NextApiRequest>({
      method: 'POST',
      body: {
        startTime: '2023-07-01T14:00:00Z',
        endTime: '2023-07-01T12:00:00Z',
        isFreeTime: true,
      },
      headers: {
        authorization: 'Bearer fake-token',
      },
    });
    const res = httpMocks.createResponse<MockResponse>();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toEqual({ error: '開始時間は終了時間より前に設定してください' });
  });
});
```