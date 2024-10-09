import { jest } from '@jest/globals';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import deleteSchedule from '@/app/api/delete-schedule.ts/route';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

interface MockResponse extends NextApiResponse {
  _getStatusCode(): number;
  _getData(): string;
}

describe('deleteSchedule API', () => {
  let mockReq: NextApiRequest;
  let mockRes: MockResponse;
  let mockSupabaseClient: any;

  beforeEach(() => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'DELETE',
    });
    mockReq = req;
    mockRes = res;

    mockSupabaseClient = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      delete: jest.fn(),
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  it('正常にスケジュールを削除できること', async () => {
    mockReq.query = { scheduleId: '123' };
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'user123' } } });
    mockSupabaseClient.delete.mockResolvedValue({ error: null });

    await deleteSchedule(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(200);
    expect(JSON.parse(mockRes._getData())).toEqual({ message: 'スケジュールが正常に削除されました' });
  });

  it('認証されていないユーザーからのリクエストを拒否すること', async () => {
    mockReq.query = { scheduleId: '123' };
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null } });

    await deleteSchedule(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(401);
    expect(JSON.parse(mockRes._getData())).toEqual({ error: '認証されていません' });
  });

  it('存在しないスケジュールの削除を試みた場合にエラーを返すこと', async () => {
    mockReq.query = { scheduleId: '999' };
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'user123' } } });
    mockSupabaseClient.delete.mockResolvedValue({ error: { message: 'スケジュールが見つかりません' } });

    await deleteSchedule(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(404);
    expect(JSON.parse(mockRes._getData())).toEqual({ error: 'スケジュールが見つかりません' });
  });

  it('scheduleIdが指定されていない場合にエラーを返すこと', async () => {
    mockReq.query = {};
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'user123' } } });

    await deleteSchedule(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(400);
    expect(JSON.parse(mockRes._getData())).toEqual({ error: 'スケジュールIDが指定されていません' });
  });

  it('データベースエラーが発生した場合に適切なエラーレスポンスを返すこと', async () => {
    mockReq.query = { scheduleId: '123' };
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'user123' } } });
    mockSupabaseClient.delete.mockRejectedValue(new Error('データベースエラー'));

    await deleteSchedule(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(500);
    expect(JSON.parse(mockRes._getData())).toEqual({ error: 'スケジュールの削除中にエラーが発生しました' });
  });
});