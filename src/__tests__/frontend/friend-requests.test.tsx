import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FriendRequests from '@/app/friend-requests/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockFriendRequests = [
  { id: '1', username: 'ユーザー1' },
  { id: '2', username: 'ユーザー2' },
];

describe('FriendRequests コンポーネント', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ friendRequests: mockFriendRequests }),
      ok: true,
    });
  });

  test('友達リクエストが正しく表示される', async () => {
    render(<FriendRequests />);

    await waitFor(() => {
      expect(screen.getByText('ユーザー1')).toBeInTheDocument();
      expect(screen.getByText('ユーザー2')).toBeInTheDocument();
    });
  });

  test('承認ボタンをクリックすると、承認リクエストが送信される', async () => {
    render(<FriendRequests />);

    await waitFor(() => {
      const approveButtons = screen.getAllByText('承認');
      fireEvent.click(approveButtons[0]);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/approve-friend-request', expect.any(Object));
    });
  });

  test('拒否ボタンをクリックすると、拒否リクエストが送信される', async () => {
    render(<FriendRequests />);

    await waitFor(() => {
      const rejectButtons = screen.getAllByText('拒否');
      fireEvent.click(rejectButtons[0]);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/reject-friend-request', expect.any(Object));
    });
  });

  test('エラーが発生した場合、エラーメッセージが表示される', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('ネットワークエラー'));

    render(<FriendRequests />);

    await waitFor(() => {
      expect(screen.getByText('友達リクエストの取得に失敗しました')).toBeInTheDocument();
    });
  });

  test('友達リクエストが空の場合、適切なメッセージが表示される', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ friendRequests: [] }),
      ok: true,
    });

    render(<FriendRequests />);

    await waitFor(() => {
      expect(screen.getByText('友達リクエストはありません')).toBeInTheDocument();
    });
  });
});