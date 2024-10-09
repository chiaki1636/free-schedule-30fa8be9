import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import getSharedScheduleHandler from '@/app/api/get-shared-schedule.ts/route';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

interface MockResponse extends NextApiResponse {
  _getStatusCode(): number;
  _getData(): string;
}

describe('getSharedScheduleHandler', () => {
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
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      data: null,
      error: null,
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('有効な共有リンクの場合、スケジュールを返すこと', async () => {
    const mockLinkToken = 'validToken';
    const mockUserId = 'userId';
    const mockSchedules = [
      { id: '1', start_time: '2023-06-01T10:00:00', end_time: '2023-06-01T12:00:00', is_free_time: true },
    ];

    mockReq.query = { linkToken: mockLinkToken };

    mockSupabase.single.mockResolvedValueOnce({ data: { user_id: mockUserId }, error: null });
    mockSupabase.select.mockResolvedValueOnce({ data: mockSchedules, error: null });

    await getSharedScheduleHandler(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(200);
    expect(JSON.parse(mockRes._getData())).toEqual({ schedules: mockSchedules });
  });

  it('無効な共有リンクの場合、404エラーを返すこと', async () => {
    const mockLinkToken = 'invalidToken';

    mockReq.query = { linkToken: mockLinkToken };

    mockSupabase.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });

    await getSharedScheduleHandler(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(404);
    expect(JSON.parse(mockRes._getData())).toEqual({ error: '共有リンクが見つかりません' });
  });

  it('スケジュール取得に失敗した場合、500エラーを返すこと', async () => {
    const mockLinkToken = 'validToken';
    const mockUserId = 'userId';

    mockReq.query = { linkToken: mockLinkToken };

    mockSupabase.single.mockResolvedValueOnce({ data: { user_id: mockUserId }, error: null });
    mockSupabase.select.mockResolvedValueOnce({ data: null, error: { message: 'Database error' } });

    await getSharedScheduleHandler(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(500);
    expect(JSON.parse(mockRes._getData())).toEqual({ error: 'スケジュールの取得に失敗しました' });
  });

  it('リンクトークンが提供されていない場合、400エラーを返すこと', async () => {
    mockReq.query = {};

    await getSharedScheduleHandler(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(400);
    expect(JSON.parse(mockRes._getData())).toEqual({ error: 'リンクトークンが必要です' });
  });

  it('GETメソッド以外のリクエストの場合、405エラーを返すこと', async () => {
    mockReq.method = 'POST';

    await getSharedScheduleHandler(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(405);
    expect(JSON.parse(mockRes._getData())).toEqual({ error: 'メソッドが許可されていません' });
  });
});