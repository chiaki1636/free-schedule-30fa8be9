import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SharedSchedule from '@/app/[linkToken]/shared-schedule/page';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('SharedSchedule', () => {
  const mockRouter = {
    push: jest.fn(),
    query: { linkToken: 'mockLinkToken' },
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ schedules: [] }),
      })
    ) as jest.Mock;
  });

  it('共有スケジュール表示画面が正しくレンダリングされること', async () => {
    render(<SharedSchedule />);
    
    await waitFor(() => {
      expect(screen.getByText('共有スケジュール')).toBeInTheDocument();
    });
  });

  it('スケジュールデータが正しく取得され表示されること', async () => {
    const mockSchedules = [
      { id: '1', startTime: '2023-06-01T10:00:00', endTime: '2023-06-01T12:00:00', isFreeTime: true },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ schedules: mockSchedules }),
    });

    render(<SharedSchedule />);

    await waitFor(() => {
      expect(screen.getByText('2023年6月1日 10:00 - 12:00')).toBeInTheDocument();
    });
  });

  it('エラーが発生した場合にエラーメッセージが表示されること', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('ネットワークエラー'));

    render(<SharedSchedule />);

    await waitFor(() => {
      expect(screen.getByText('スケジュールの取得中にエラーが発生しました。')).toBeInTheDocument();
    });
  });

  it('「戻る」ボタンをクリックするとホーム画面に遷移すること', () => {
    render(<SharedSchedule />);

    const backButton = screen.getByText('戻る');
    fireEvent.click(backButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });
});