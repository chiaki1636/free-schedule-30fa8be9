import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import generateShareLink from '@/app/api/generate-share-link/route';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

interface MockResponse extends NextApiResponse {
  _getStatusCode(): number;
  _getData(): string;
}

describe('generateShareLink API', () => {
  let mockReq: NextApiRequest;
  let mockRes: MockResponse;
  let mockSupabase: any;

  beforeEach(() => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'POST',
    });
    mockReq = req;
    mockRes = res;

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      insert: jest.fn(),
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('有効期限付きの共有リンクを生成する', async () => {
    const expirationDate = '2023-12-31';
    mockReq.body = JSON.stringify({ expirationDate });
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-id' } } });
    mockSupabase.insert.mockResolvedValue({ data: { link_token: 'abc123' } });

    await generateShareLink(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(200);
    const responseData = JSON.parse(mockRes._getData());
    expect(responseData).toHaveProperty('link');
    expect(responseData.link).toContain('abc123');
    expect(mockSupabase.from).toHaveBeenCalledWith('share_links');
    expect(mockSupabase.insert).toHaveBeenCalledWith({
      user_id: 'user-id',
      link_token: expect.any(String),
      expiration_date: expirationDate,
    });
  });

  it('有効期限なしの共有リンクを生成する', async () => {
    mockReq.body = JSON.stringify({});
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-id' } } });
    mockSupabase.insert.mockResolvedValue({ data: { link_token: 'def456' } });

    await generateShareLink(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(200);
    const responseData = JSON.parse(mockRes._getData());
    expect(responseData).toHaveProperty('link');
    expect(responseData.link).toContain('def456');
    expect(mockSupabase.from).toHaveBeenCalledWith('share_links');
    expect(mockSupabase.insert).toHaveBeenCalledWith({
      user_id: 'user-id',
      link_token: expect.any(String),
      expiration_date: null,
    });
  });

  it('認証されていないユーザーからのリクエストを拒否する', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    await generateShareLink(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(401);
    expect(JSON.parse(mockRes._getData())).toEqual({ error: '認証されていません' });
  });

  it('データベース挿入エラーを適切に処理する', async () => {
    mockReq.body = JSON.stringify({});
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-id' } } });
    mockSupabase.insert.mockRejectedValue(new Error('データベースエラー'));

    await generateShareLink(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(500);
    expect(JSON.parse(mockRes._getData())).toEqual({ error: '共有リンクの生成に失敗しました' });
  });

  it('不正なリクエストメソッドを拒否する', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'GET',
    });

    await generateShareLink(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({ error: 'メソッドが許可されていません' });
  });
});