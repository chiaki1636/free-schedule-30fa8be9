import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationSettings from '@/app/notification-settings/page';
import axios from 'axios';

jest.mock('axios');

describe('通知設定画面', () => {
  beforeEach(() => {
    axios.post.mockResolvedValue({ data: { success: true } });
  });

  test('コンポーネントが正しくレンダリングされる', () => {
    render(<NotificationSettings />);
    expect(screen.getByText('通知設定')).toBeInTheDocument();
    expect(screen.getByLabelText('メール通知')).toBeInTheDocument();
    expect(screen.getByLabelText('プッシュ通知')).toBeInTheDocument();
    expect(screen.getByLabelText('通知頻度')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
  });

  test('スイッチの切り替えが正しく動作する', () => {
    render(<NotificationSettings />);
    const emailSwitch = screen.getByLabelText('メール通知');
    const pushSwitch = screen.getByLabelText('プッシュ通知');

    fireEvent.click(emailSwitch);
    expect(emailSwitch).toBeChecked();

    fireEvent.click(pushSwitch);
    expect(pushSwitch).toBeChecked();
  });

  test('通知頻度の選択が正しく動作する', () => {
    render(<NotificationSettings />);
    const frequencySelect = screen.getByLabelText('通知頻度');

    fireEvent.change(frequencySelect, { target: { value: 'daily' } });
    expect(frequencySelect).toHaveValue('daily');
  });

  test('保存ボタンクリック時に正しくAPIが呼ばれる', async () => {
    render(<NotificationSettings />);
    const saveButton = screen.getByRole('button', { name: '保存' });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/update-notification-settings', expect.any(Object));
    });
  });

  test('APIエラー時にエラーメッセージが表示される', async () => {
    axios.post.mockRejectedValueOnce(new Error('API Error'));
    render(<NotificationSettings />);
    const saveButton = screen.getByRole('button', { name: '保存' });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('設定の保存に失敗しました。')).toBeInTheDocument();
    });
  });

  test('設定保存成功時に成功メッセージが表示される', async () => {
    render(<NotificationSettings />);
    const saveButton = screen.getByRole('button', { name: '保存' });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('設定が保存されました。')).toBeInTheDocument();
    });
  });
});