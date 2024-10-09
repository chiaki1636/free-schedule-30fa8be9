import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/app/index/page';
import { act } from 'react-dom/test-utils';

// モックの設定
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('axios');

describe('Home コンポーネント', () => {
  beforeEach(() => {
    // Axios モックのリセット
    jest.clearAllMocks();
  });

  test('ユーザーの予定リストが表示される', async () => {
    const mockSchedules = [
      { id: '1', title: '予定1', start_time: '2023-06-01T10:00:00', end_time: '2023-06-01T11:00:00' },
      { id: '2', title: '予定2', start_time: '2023-06-02T14:00:00', end_time: '2023-06-02T15:00:00' },
    ];

    global.axios.get.mockResolvedValue({ data: mockSchedules });

    await act(async () => {
      render(<Home />);
    });

    await waitFor(() => {
      expect(screen.getByText('予定1')).toBeInTheDocument();
      expect(screen.getByText('予定2')).toBeInTheDocument();
    });
  });

  test('友達の暇な時間タイムラインが表示される', async () => {
    const mockFriendSchedules = [
      { id: '3', username: '友達1', start_time: '2023-06-03T13:00:00', end_time: '2023-06-03T14:00:00' },
      { id: '4', username: '友達2', start_time: '2023-06-04T16:00:00', end_time: '2023-06-04T17:00:00' },
    ];

    global.axios.get.mockResolvedValue({ data: mockFriendSchedules });

    await act(async () => {
      render(<Home />);
    });

    await waitFor(() => {
      expect(screen.getByText('友達1')).toBeInTheDocument();
      expect(screen.getByText('友達2')).toBeInTheDocument();
    });
  });

  test('予定追加ボタンをクリックすると予定追加画面に遷移する', async () => {
    const mockPush = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockImplementation(() => ({
      push: mockPush,
    }));

    render(<Home />);

    const addButton = screen.getByText('予定を追加');
    fireEvent.click(addButton);

    expect(mockPush).toHaveBeenCalledWith('/add-schedule');
  });

  test('ナビゲーションバーが表示される', () => {
    render(<Home />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('ホーム')).toBeInTheDocument();
    expect(screen.getByText('フレンド')).toBeInTheDocument();
    expect(screen.getByText('設定')).toBeInTheDocument();
  });

  test('スケジュールの取得に失敗した場合エラーメッセージが表示される', async () => {
    global.axios.get.mockRejectedValue(new Error('スケジュールの取得に失敗しました'));

    await act(async () => {
      render(<Home />);
    });

    await waitFor(() => {
      expect(screen.getByText('スケジュールの取得に失敗しました')).toBeInTheDocument();
    });
  });
});