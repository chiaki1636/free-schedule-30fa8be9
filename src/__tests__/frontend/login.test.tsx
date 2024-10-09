import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/login/page';
import axios from 'axios';

jest.mock('axios');

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ログインフォームが正しくレンダリングされること', () => {
    render(<LoginPage />);
    
    expect(screen.getByLabelText('ユーザー名またはメールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
    expect(screen.getByText('パスワードを忘れた場合')).toBeInTheDocument();
    expect(screen.getByText('新規登録')).toBeInTheDocument();
  });

  test('フォームの入力値が正しく更新されること', async () => {
    render(<LoginPage />);
    
    const usernameInput = screen.getByLabelText('ユーザー名またはメールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(passwordInput, 'password123');

    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('password123');
  });

  test('ログイン成功時にホーム画面に遷移すること', async () => {
    (axios.post as jest.Mock).mockResolvedValue({ data: { token: 'fake-token' } });
    
    render(<LoginPage />);
    
    await userEvent.type(screen.getByLabelText('ユーザー名またはメールアドレス'), 'testuser');
    await userEvent.type(screen.getByLabelText('パスワード'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/login', {
        username: 'testuser',
        password: 'password123'
      });
      expect(global.mockNextRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('ログイン失敗時にエラーメッセージが表示されること', async () => {
    (axios.post as jest.Mock).mockRejectedValue(new Error('認証に失敗しました'));
    
    render(<LoginPage />);
    
    await userEvent.type(screen.getByLabelText('ユーザー名またはメールアドレス'), 'wronguser');
    await userEvent.type(screen.getByLabelText('パスワード'), 'wrongpassword');
    await userEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(screen.getByText('認証に失敗しました')).toBeInTheDocument();
    });
  });

  test('パスワード忘れリンクがクリックされた時に正しいページに遷移すること', async () => {
    render(<LoginPage />);
    
    await userEvent.click(screen.getByText('パスワードを忘れた場合'));

    expect(global.mockNextRouter.push).toHaveBeenCalledWith('/forgot-password');
  });

  test('新規登録リンクがクリックされた時に正しいページに遷移すること', async () => {
    render(<LoginPage />);
    
    await userEvent.click(screen.getByText('新規登録'));

    expect(global.mockNextRouter.push).toHaveBeenCalledWith('/register');
  });
});