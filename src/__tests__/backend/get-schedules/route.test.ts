import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import getSchedulesHandler from '@/app/api/get-schedules/route';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

interface MockResponse extends NextApiResponse {
  _getStatusCode(): number;
  _getData(): string;
}

describe('getSchedulesHandler', () => {
  let mockReq: NextApiRequest;
  let mockRes: MockResponse;
  let mockSupabase: any;

  beforeEach(() => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'GET',
    });
    mockReq = req;
    mockRes = res;

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('正常にスケジュールを取得できる', async () => {
    const mockUser = { id: 'user-123' };
    const mockSchedules = [
      { id: 1, title: '予定1', start_time: '2023-06-01T10:00:00', end_time: '2023-06-01T11:00:00' },
      { id: 2, title: '予定2', start_time: '2023-06-02T14:00:00', end_time: '2023-06-02T15:00:00' },
    ];

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    mockSupabase.select.mockResolvedValue({ data: mockSchedules, error: null });

    await getSchedulesHandler(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(200);
    expect(JSON.parse(mockRes._getData())).toEqual(mockSchedules);
  });

  it('認証されていない場合は401エラーを返す', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    await getSchedulesHandler(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(401);
    expect(JSON.parse(mockRes._getData())).toEqual({ error: '認証されていません' });
  });

  it('データベースエラーの場合は500エラーを返す', async () => {
    const mockUser = { id: 'user-123' };
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    mockSupabase.select.mockResolvedValue({ data: null, error: new Error('データベースエラー') });

    await getSchedulesHandler(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(500);
    expect(JSON.parse(mockRes._getData())).toEqual({ error: 'スケジュールの取得に失敗しました' });
  });

  it('GETメソッド以外のリクエストは405エラーを返す', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'POST',
    });

    await getSchedulesHandler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({ error: 'メソッドが許可されていません' });
  });
});