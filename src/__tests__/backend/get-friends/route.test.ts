import { jest } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import getFriends from '@/app/api/get-friends/route';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js');

describe('getFriends API', () => {
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    data: null,
    error: null,
  };

  beforeEach(() => {
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('正常に友達リストを取得できる', async () => {
    const mockFriends = [
      { id: '1', username: '友達1' },
      { id: '2', username: '友達2' },
    ];
    mockSupabase.data = mockFriends;

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer validToken',
      },
    });

    await getFriends(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(mockFriends);
  });

  it('認証エラーの場合、401エラーを返す', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer invalidToken',
      },
    });

    await getFriends(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({ error: '認証エラー' });
  });

  it('データベースエラーの場合、500エラーを返す', async () => {
    mockSupabase.error = { message: 'データベースエラー' };

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer validToken',
      },
    });

    await getFriends(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({ error: 'データベースエラー' });
  });

  it('GET以外のメソッドの場合、405エラーを返す', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });

    await getFriends(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({ error: 'メソッドが許可されていません' });
  });
});