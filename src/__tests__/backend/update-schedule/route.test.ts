import { jest } from '@jest/globals';
import { NextApiRequest, NextApiResponse } from 'next';
import httpMocks from 'node-mocks-http';
import { createClient } from '@supabase/supabase-js';
import updateSchedule from '@/app/api/update-schedule.ts/route';

jest.mock('@supabase/supabase-js');

interface MockResponse extends NextApiResponse {
  _getStatusCode(): number;
  _getData(): string;
}

describe('updateSchedule API', () => {
  let req: NextApiRequest;
  let res: MockResponse;
  let mockSupabaseClient: any;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    mockSupabaseClient = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      update: jest.fn().mockReturnThis(),
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  it('認証されていないユーザーからのリクエストを拒否する', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null } });

    await updateSchedule(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({ error: '認証が必要です' });
  });

  it('存在しないスケジュールの更新を拒否する', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-id' } } });
    mockSupabaseClient.single.mockResolvedValue({ data: null });

    req.body = {
      id: 'non-existent-id',
      startTime: '2023-07-01T10:00:00',
      endTime: '2023-07-01T12:00:00',
      isFreeTime: true,
    };

    await updateSchedule(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(JSON.parse(res._getData())).toEqual({ error: 'スケジュールが見つかりません' });
  });

  it('他のユーザーのスケジュール更新を拒否する', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-id' } } });
    mockSupabaseClient.single.mockResolvedValue({ data: { user_id: 'other-user-id' } });

    req.body = {
      id: 'schedule-id',
      startTime: '2023-07-01T10:00:00',
      endTime: '2023-07-01T12:00:00',
      isFreeTime: true,
    };

    await updateSchedule(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(JSON.parse(res._getData())).toEqual({ error: 'このスケジュールを更新する権限がありません' });
  });

  it('有効なリクエストでスケジュールを更新する', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-id' } } });
    mockSupabaseClient.single.mockResolvedValue({ data: { user_id: 'user-id' } });
    mockSupabaseClient.update.mockResolvedValue({
      data: {
        id: 'schedule-id',
        startTime: '2023-07-01T10:00:00',
        endTime: '2023-07-01T12:00:00',
        isFreeTime: true,
      },
    });

    req.body = {
      id: 'schedule-id',
      startTime: '2023-07-01T10:00:00',
      endTime: '2023-07-01T12:00:00',
      isFreeTime: true,
    };

    await updateSchedule(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      id: 'schedule-id',
      startTime: '2023-07-01T10:00:00',
      endTime: '2023-07-01T12:00:00',
      isFreeTime: true,
    });
  });

  it('無効な日時形式のリクエストを拒否する', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-id' } } });
    mockSupabaseClient.single.mockResolvedValue({ data: { user_id: 'user-id' } });

    req.body = {
      id: 'schedule-id',
      startTime: 'invalid-date',
      endTime: '2023-07-01T12:00:00',
      isFreeTime: true,
    };

    await updateSchedule(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ error: '無効な日時形式です' });
  });

  it('終了時間が開始時間より前の場合リクエストを拒否する', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-id' } } });
    mockSupabaseClient.single.mockResolvedValue({ data: { user_id: 'user-id' } });

    req.body = {
      id: 'schedule-id',
      startTime: '2023-07-01T12:00:00',
      endTime: '2023-07-01T10:00:00',
      isFreeTime: true,
    };

    await updateSchedule(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ error: '終了時間は開始時間より後である必要があります' });
  });

  it('データベースエラー時に適切なエラーレスポンスを返す', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-id' } } });
    mockSupabaseClient.single.mockResolvedValue({ data: { user_id: 'user-id' } });
    mockSupabaseClient.update.mockRejectedValue(new Error('データベースエラー'));

    req.body = {
      id: 'schedule-id',
      startTime: '2023-07-01T10:00:00',
      endTime: '2023-07-01T12:00:00',
      isFreeTime: true,
    };

    await updateSchedule(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({ error: 'スケジュールの更新中にエラーが発生しました' });
  });
});