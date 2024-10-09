import { jest } from '@jest/globals';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import updateProfile from '@/app/api/update-profile/route';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

interface MockResponse extends NextApiResponse {
  _getStatusCode(): number;
  _getData(): string;
}

describe('updateProfile API', () => {
  let mockReq: NextApiRequest;
  let mockRes: MockResponse;
  let mockSupabaseClient: any;

  beforeEach(() => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'PUT',
    });
    mockReq = req;
    mockRes = res;

    mockSupabaseClient = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      update: jest.fn(),
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  it('正常にプロフィールを更新できる', async () => {
    const userId = 'test-user-id';
    const updatedProfile = {
      username: '新しいユーザー名',
      email: 'newemail@example.com',
      password: 'newpassword123',
    };

    mockReq.body = updatedProfile;
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: userId } } });
    mockSupabaseClient.update.mockResolvedValue({ data: updatedProfile, error: null });

    await updateProfile(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(200);
    expect(JSON.parse(mockRes._getData())).toEqual({
      message: 'プロフィールが更新されました',
      user: updatedProfile,
    });
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
    expect(mockSupabaseClient.update).toHaveBeenCalledWith(updatedProfile, { returning: 'minimal' });
  });

  it('認証エラーの場合、401エラーを返す', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error('認証エラー') });

    await updateProfile(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(401);
    expect(JSON.parse(mockRes._getData())).toEqual({ message: '認証に失敗しました' });
  });

  it('データベース更新エラーの場合、500エラーを返す', async () => {
    const userId = 'test-user-id';
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: userId } } });
    mockSupabaseClient.update.mockResolvedValue({ data: null, error: new Error('データベースエラー') });

    await updateProfile(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(500);
    expect(JSON.parse(mockRes._getData())).toEqual({ message: 'プロフィールの更新に失敗しました' });
  });

  it('無効なリクエストボディの場合、400エラーを返す', async () => {
    mockReq.body = {};

    await updateProfile(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(400);
    expect(JSON.parse(mockRes._getData())).toEqual({ message: '無効なリクエストデータです' });
  });

  it('HTTPメソッドがPUT以外の場合、405エラーを返す', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'GET',
    });

    await updateProfile(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({ message: 'メソッドが許可されていません' });
  });
});