import { jest } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import updateNotificationSettings from '@/app/api/update-notification-settings/route';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

interface MockResponse extends NextApiResponse {
  _getStatusCode(): number;
  _getData(): string;
}

describe('updateNotificationSettings API', () => {
  let mockReq: NextApiRequest;
  let mockRes: MockResponse;
  let mockSupabaseClient: any;

  beforeEach(() => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'POST',
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

  it('正常に通知設定を更新できること', async () => {
    mockReq.body = {
      emailNotifications: true,
      pushNotifications: false,
      notificationFrequency: 'daily',
    };
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-id' } } });
    mockSupabaseClient.update.mockResolvedValue({ data: { success: true }, error: null });

    await updateNotificationSettings(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(200);
    expect(JSON.parse(mockRes._getData())).toEqual({ success: true });
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
    expect(mockSupabaseClient.update).toHaveBeenCalledWith({
      email_notifications: true,
      push_notifications: false,
      notification_frequency: 'daily',
    });
  });

  it('認証エラーの場合、401エラーを返すこと', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error('Unauthorized') });

    await updateNotificationSettings(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(401);
    expect(JSON.parse(mockRes._getData())).toEqual({ error: 'Unauthorized' });
  });

  it('データベース更新エラーの場合、500エラーを返すこと', async () => {
    mockReq.body = {
      emailNotifications: true,
      pushNotifications: false,
      notificationFrequency: 'daily',
    };
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-id' } } });
    mockSupabaseClient.update.mockResolvedValue({ data: null, error: new Error('Database error') });

    await updateNotificationSettings(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(500);
    expect(JSON.parse(mockRes._getData())).toEqual({ error: 'Failed to update notification settings' });
  });

  it('無効なリクエストボディの場合、400エラーを返すこと', async () => {
    mockReq.body = {
      emailNotifications: 'invalid',
      pushNotifications: 'invalid',
      notificationFrequency: 'invalid',
    };

    await updateNotificationSettings(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(400);
    expect(JSON.parse(mockRes._getData())).toEqual({ error: 'Invalid request body' });
  });

  it('HTTPメソッドがPOST以外の場合、405エラーを返すこと', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'GET',
    });

    await updateNotificationSettings(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Method Not Allowed' });
  });
});