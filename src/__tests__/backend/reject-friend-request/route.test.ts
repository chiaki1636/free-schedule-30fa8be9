import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import handleRejectFriendRequest from '@/app/api/reject-friend-request/route';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js');

describe('友達リクエスト拒否 API', () => {
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    delete: jest.fn(),
    eq: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  };

  beforeEach(() => {
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('友達リクエストを正常に拒否する', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: { requestId: 'mock-request-id' },
    });

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'mock-user-id' } } });
    mockSupabase.delete.mockResolvedValue({ data: null, error: null });

    await handleRejectFriendRequest(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ message: '友達リクエストを拒否しました' });
    expect(mockSupabase.from).toHaveBeenCalledWith('friends');
    expect(mockSupabase.delete).toHaveBeenCalled();
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'mock-request-id');
  });

  it('認証されていないユーザーからのリクエストを拒否する', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: { requestId: 'mock-request-id' },
    });

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error('認証エラー') });

    await handleRejectFriendRequest(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({ error: '認証されていません' });
  });

  it('リクエストIDが提供されていない場合にエラーを返す', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {},
    });

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'mock-user-id' } } });

    await handleRejectFriendRequest(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ error: 'リクエストIDが必要です' });
  });

  it('データベースエラーが発生した場合にエラーを返す', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: { requestId: 'mock-request-id' },
    });

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'mock-user-id' } } });
    mockSupabase.delete.mockResolvedValue({ data: null, error: new Error('データベースエラー') });

    await handleRejectFriendRequest(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({ error: '友達リクエストの拒否中にエラーが発生しました' });
  });

  it('POSTメソッド以外のリクエストを拒否する', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await handleRejectFriendRequest(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({ error: 'メソッドが許可されていません' });
  });
});