import { jest } from '@jest/globals';
import { NextApiRequest, NextApiResponse } from 'next';
import httpMocks from 'node-mocks-http';
import handleSendFriendRequest from '@/app/api/send-friend-request.ts/route';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

interface MockResponse extends NextApiResponse {
  _getStatusCode(): number;
  _getData(): string;
}

describe('友達リクエスト送信ハンドラー', () => {
  let mockReq: NextApiRequest;
  let mockRes: MockResponse;
  let mockSupabaseClient: any;

  beforeEach(() => {
    mockReq = httpMocks.createRequest();
    mockRes = httpMocks.createResponse();
    mockSupabaseClient = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      insert: jest.fn(),
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  it('正常に友達リクエストを送信できる', async () => {
    mockReq.method = 'POST';
    mockReq.body = { friendId: 'friend-user-id' };
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'current-user-id' } } });
    mockSupabaseClient.insert.mockResolvedValue({ data: { id: 'new-friend-request-id' }, error: null });

    await handleSendFriendRequest(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(200);
    expect(JSON.parse(mockRes._getData())).toEqual({ message: '友達リクエストを送信しました' });
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('friends');
    expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
      user_id: 'current-user-id',
      friend_id: 'friend-user-id',
      status: 'pending',
    });
  });

  it('認証されていないユーザーからのリクエストを拒否する', async () => {
    mockReq.method = 'POST';
    mockReq.body = { friendId: 'friend-user-id' };
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error('認証エラー') });

    await handleSendFriendRequest(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(401);
    expect(JSON.parse(mockRes._getData())).toEqual({ error: '認証されていません' });
  });

  it('不正なHTTPメソッドを拒否する', async () => {
    mockReq.method = 'GET';

    await handleSendFriendRequest(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(405);
    expect(JSON.parse(mockRes._getData())).toEqual({ error: 'メソッドが許可されていません' });
  });

  it('friendIdが欠落している場合にエラーを返す', async () => {
    mockReq.method = 'POST';
    mockReq.body = {};
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'current-user-id' } } });

    await handleSendFriendRequest(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(400);
    expect(JSON.parse(mockRes._getData())).toEqual({ error: 'friendIdは必須です' });
  });

  it('データベース挿入エラーを適切に処理する', async () => {
    mockReq.method = 'POST';
    mockReq.body = { friendId: 'friend-user-id' };
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'current-user-id' } } });
    mockSupabaseClient.insert.mockResolvedValue({ data: null, error: new Error('データベースエラー') });

    await handleSendFriendRequest(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(500);
    expect(JSON.parse(mockRes._getData())).toEqual({ error: '友達リクエストの送信に失敗しました' });
  });
});