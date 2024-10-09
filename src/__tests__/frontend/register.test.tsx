import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Register from '@/app/register/page';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('Register コンポーネント', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
  });

  test('全ての入力フィールドとボタンが表示されること', () => {
    render(<Register />);
    
    expect(screen.getByLabelText('ユーザー名')).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード確認')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登録' })).toBeInTheDocument();
    expect(screen.getByText('ログイン画面へ')).toBeInTheDocument();
  });

  test('バリデーションエラーが表示されること', async () => {
    render(<Register />);
    
    fireEvent.click(screen.getByRole('button', { name: '登録' }));

    await waitFor(() => {
      expect(screen.getByText('ユーザー名を入力してください')).toBeInTheDocument();
      expect(screen.getByText('メールアドレスを入力してください')).toBeInTheDocument();
      expect(screen.getByText('パスワードを入力してください')).toBeInTheDocument();
      expect(screen.getByText('パスワード確認を入力してください')).toBeInTheDocument();
    });
  });

  test('パスワードと確認用パスワードが一致しない場合エラーが表示されること', async () => {
    render(<Register />);
    
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('パスワード確認'), { target: { value: 'password456' } });
    fireEvent.click(screen.getByRole('button', { name: '登録' }));

    await waitFor(() => {
      expect(screen.getByText('パスワードが一致しません')).toBeInTheDocument();
    });
  });

  test('正常に登録できること', async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: '登録成功' }),
    });

    render(<Register />);
    
    fireEvent.change(screen.getByLabelText('ユーザー名'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('メールアドレス'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('パスワード確認'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: '登録' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  test('登録に失敗した場合エラーメッセージが表示されること', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: '登録に失敗しました' }),
    });

    render(<Register />);
    
    fireEvent.change(screen.getByLabelText('ユーザー名'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('メールアドレス'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('パスワード確認'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: '登録' }));

    await waitFor(() => {
      expect(screen.getByText('登録に失敗しました')).toBeInTheDocument();
    });
  });

  test('ログイン画面リンクが正しく機能すること', () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    render(<Register />);
    
    fireEvent.click(screen.getByText('ログイン画面へ'));

    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});