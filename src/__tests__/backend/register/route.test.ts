import { jest } from '@jest/globals';
import { NextApiRequest, NextApiResponse } from 'next';
import httpMocks from 'node-mocks-http';
import handler from '@/app/api/register/route';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js');

interface MockResponse extends NextApiResponse {
  _getStatusCode(): number;
  _getData(): string;
}

describe('登録APIのテスト', () => {
  let req: NextApiRequest;
  let res: MockResponse;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
  });

  it('正常な登録処理のテスト', async () => {
    const mockInsert = jest.fn().mockResolvedValue({ data: { id: '1' }, error: null });
    (createClient as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        insert: mockInsert,
      }),
    });

    req.method = 'POST';
    req.body = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toEqual({ message: 'ユーザーが正常に登録されました' });
  });

  it('不正なリクエストのテスト', async () => {
    req.method = 'POST';
    req.body = {
      username: 'testuser',
      email: 'invalid-email',
      password: 'short',
    };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ message: 'バリデーションエラー' });
  });

  it('既存のユーザー名またはメールアドレスのテスト', async () => {
    const mockInsert = jest.fn().mockResolvedValue({ data: null, error: { message: 'ユーザー名またはメールアドレスが既に存在します' } });
    (createClient as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        insert: mockInsert,
      }),
    });

    req.method = 'POST';
    req.body = {
      username: 'existinguser',
      email: 'existing@example.com',
      password: 'password123',
    };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(409);
    expect(JSON.parse(res._getData())).toEqual({ message: 'ユーザー名またはメールアドレスが既に存在します' });
  });

  it('データベースエラーのテスト', async () => {
    const mockInsert = jest.fn().mockRejectedValue(new Error('データベースエラー'));
    (createClient as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        insert: mockInsert,
      }),
    });

    req.method = 'POST';
    req.body = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({ message: '内部サーバーエラー' });
  });

  it('サポートされていないHTTPメソッドのテスト', async () => {
    req.method = 'GET';

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({ message: 'メソッドが許可されていません' });
  });
});