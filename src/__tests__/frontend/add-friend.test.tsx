import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddFriend from '@/app/add-friend/page';
import { act } from 'react-dom/test-utils';

// モックの設定
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('友達追加画面', () => {
  beforeEach(() => {
    // フェッチのモックをリセット
    global.fetch.mockReset();
  });

  test('ユーザー検索バーが表示される', () => {
    render(<AddFriend />);
    expect(screen.getByPlaceholderText('ユーザー名またはメールアドレスを入力')).toBeInTheDocument();
  });

  test('検索結果が表示される', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([{ id: '1', username: 'テストユーザー' }]),
    });

    render(<AddFriend />);
    const searchInput = screen.getByPlaceholderText('ユーザー名またはメールアドレスを入力');
    fireEvent.change(searchInput, { target: { value: 'テスト' } });

    await waitFor(() => {
      expect(screen.getByText('テストユーザー')).toBeInTheDocument();
    });
  });

  test('友達リクエスト送信ボタンをクリックできる', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([{ id: '1', username: 'テストユーザー' }]),
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: '友達リクエストを送信しました' }),
    });

    render(<AddFriend />);
    const searchInput = screen.getByPlaceholderText('ユーザー名またはメールアドレスを入力');
    fireEvent.change(searchInput, { target: { value: 'テスト' } });

    await waitFor(() => {
      const sendRequestButton = screen.getByText('友達リクエスト送信');
      fireEvent.click(sendRequestButton);
    });

    await waitFor(() => {
      expect(screen.getByText('友達リクエストを送信しました')).toBeInTheDocument();
    });
  });

  test('エラー時にエラーメッセージが表示される', async () => {
    global.fetch.mockRejectedValueOnce(new Error('ネットワークエラー'));

    render(<AddFriend />);
    const searchInput = screen.getByPlaceholderText('ユーザー名またはメールアドレスを入力');
    fireEvent.change(searchInput, { target: { value: 'テスト' } });

    await waitFor(() => {
      expect(screen.getByText('エラーが発生しました：ネットワークエラー')).toBeInTheDocument();
    });
  });
});