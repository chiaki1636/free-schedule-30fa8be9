import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileSettings from '@/app/profile-settings/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('ProfileSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('初期レンダリング時に正しくコンポーネントが表示される', () => {
    render(<ProfileSettings />);
    
    expect(screen.getByLabelText('ユーザー名')).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('新しいパスワード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
  });

  test('入力フィールドの値が変更できる', () => {
    render(<ProfileSettings />);
    
    const usernameInput = screen.getByLabelText('ユーザー名');
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('新しいパスワード');

    fireEvent.change(usernameInput, { target: { value: '新しいユーザー名' } });
    fireEvent.change(emailInput, { target: { value: 'newemail@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });

    expect(usernameInput).toHaveValue('新しいユーザー名');
    expect(emailInput).toHaveValue('newemail@example.com');
    expect(passwordInput).toHaveValue('newpassword123');
  });

  test('フォーム送信時にAPIが呼び出され、成功メッセージが表示される', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'プロフィールが更新されました' }),
    });

    render(<ProfileSettings />);

    fireEvent.change(screen.getByLabelText('ユーザー名'), { target: { value: '新しいユーザー名' } });
    fireEvent.change(screen.getByLabelText('メールアドレス'), { target: { value: 'newemail@example.com' } });
    fireEvent.change(screen.getByLabelText('新しいパスワード'), { target: { value: 'newpassword123' } });

    fireEvent.click(screen.getByRole('button', { name: '保存' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/update-profile', expect.any(Object));
      expect(screen.getByText('プロフィールが更新されました')).toBeInTheDocument();
    });
  });

  test('APIエラー時にエラーメッセージが表示される', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'プロフィールの更新に失敗しました' }),
    });

    render(<ProfileSettings />);

    fireEvent.click(screen.getByRole('button', { name: '保存' }));

    await waitFor(() => {
      expect(screen.getByText('プロフィールの更新に失敗しました')).toBeInTheDocument();
    });
  });
});