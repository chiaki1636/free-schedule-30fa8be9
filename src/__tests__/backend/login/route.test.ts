```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import httpMocks from 'node-mocks-http';
import login from '@/app/api/login/route';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js');

interface MockResponse extends NextApiResponse {
  _getStatusCode(): number;
  _getData(): string;
}

describe('ログインAPI', () => {
  let req: NextApiRequest;
  let res: MockResponse;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
  });

  it('正常なログインでJWTトークンを返すこと', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    const mockToken = 'mock_jwt_token';

    (createClient as jest.Mock).mockReturnValue({
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null
        }),
        signOut: jest.fn()
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: [mockUser],
        error: null
      })
    });

    req.method = 'POST';
    req.body = { username: 'testuser', password: 'password123' };

    await login(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('token');
  });

  it('無効な認証情報でエラーを返すこと', async () => {
    (createClient as jest.Mock).mockReturnValue({
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({
          data: null,
          error: { message: '認証に失敗しました' }
        })
      }
    });

    req.method = 'POST';
    req.body = { username: 'wronguser', password: 'wrongpassword' };

    await login(req, res);

    expect(res._getStatusCode()).toBe(401);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('error', '認証に失敗しました');
  });

  it('POSTメソッド以外でリクエストした場合にエラーを返すこと', async () => {
    req.method = 'GET';

    await login(req, res);

    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('error', 'メソッドが許可されていません');
  });

  it('必要なパラメータが欠けている場合にエラーを返すこと', async () => {
    req.method = 'POST';
    req.body = { username: 'testuser' };

    await login(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('error', 'ユーザー名とパスワードが必要です');
  });

  it('データベースエラーが発生した場合にエラーを返すこと', async () => {
    (createClient as jest.Mock).mockReturnValue({
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({
          data: { user: { id: '1', email: 'test@example.com' } },
          error: null
        }),
        signOut: jest.fn()
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'データベースエラー' }
      })
    });

    req.method = 'POST';
    req.body = { username: 'testuser', password: 'password123' };

    await login(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('error', 'サーバーエラーが発生しました');
  });
});
```