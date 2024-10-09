import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import approveFriendRequestHandler from '@/app/api/approve-friend-request/route';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('友達リクエスト承認 API', () => {
  let mockReq: NextApiRequest;
  let mockRes: NextApiResponse;
  let mockSupabase: any;

  beforeEach(() => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    });
    mockReq = req;
    mockRes = res;

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      update: jest.fn(),
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('友達リクエストを正常に承認する', async () => {
    mockReq.body = { requestId: '123' };
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user123' } } });
    mockSupabase.update.mockResolvedValue({ data: null, error: null });

    await approveFriendRequestHandler(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(200);
    expect(JSON.parse(mockRes._getData())).toEqual({ message: '友達リクエストが承認されました' });
    expect(mockSupabase.from).toHaveBeenCalledWith('friends');
    expect(mockSupabase.update).toHaveBeenCalledWith({ status: 'approved' }, { returning: 'minimal' });
  });

  it('認証されていない場合はエラーを返す', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    await approveFriendRequestHandler(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(401);
    expect(JSON.parse(mockRes._getData())).toEqual({ error: '認証されていません' });
  });

  it('リクエストIDが不足している場合はエラーを返す', async () => {
    mockReq.body = {};
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user123' } } });

    await approveFriendRequestHandler(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(400);
    expect(JSON.parse(mockRes._getData())).toEqual({ error: 'リクエストIDが必要です' });
  });

  it('データベース更新エラーの場合はエラーを返す', async () => {
    mockReq.body = { requestId: '123' };
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user123' } } });
    mockSupabase.update.mockResolvedValue({ data: null, error: new Error('データベースエラー') });

    await approveFriendRequestHandler(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(500);
    expect(JSON.parse(mockRes._getData())).toEqual({ error: '友達リクエストの承認中にエラーが発生しました' });
  });

  it('HTTPメソッドが不正な場合はエラーを返す', async () => {
    mockReq.method = 'GET';

    await approveFriendRequestHandler(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(405);
    expect(JSON.parse(mockRes._getData())).toEqual({ error: 'メソッドが許可されていません' });
  });
});