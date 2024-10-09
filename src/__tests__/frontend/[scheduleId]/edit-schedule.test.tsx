import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditSchedule from '@/app/[scheduleId]/edit-schedule/page';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('EditSchedule コンポーネント', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('既存の予定情報が表示される', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: '1',
        startTime: '2023-06-01T10:00:00',
        endTime: '2023-06-01T12:00:00',
        isFreeTime: true,
      }),
    });

    render(<EditSchedule params={{ scheduleId: '1' }} />);

    await waitFor(() => {
      expect(screen.getByLabelText('開始時間')).toHaveValue('2023-06-01T10:00:00');
      expect(screen.getByLabelText('終了時間')).toHaveValue('2023-06-01T12:00:00');
      expect(screen.getByLabelText('暇な時間')).toBeChecked();
    });
  });

  it('予定を更新できる', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: '1',
          startTime: '2023-06-01T10:00:00',
          endTime: '2023-06-01T12:00:00',
          isFreeTime: true,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: '更新成功' }),
      });

    render(<EditSchedule params={{ scheduleId: '1' }} />);

    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('開始時間'), { target: { value: '2023-06-01T11:00:00' } });
      fireEvent.change(screen.getByLabelText('終了時間'), { target: { value: '2023-06-01T13:00:00' } });
      fireEvent.click(screen.getByLabelText('暇な時間'));
    });

    fireEvent.click(screen.getByText('更新'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
  });

  it('予定を削除できる', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: '1',
          startTime: '2023-06-01T10:00:00',
          endTime: '2023-06-01T12:00:00',
          isFreeTime: true,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: '削除成功' }),
      });

    render(<EditSchedule params={{ scheduleId: '1' }} />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('削除'));
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
  });

  it('キャンセルボタンでホーム画面に戻る', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: '1',
        startTime: '2023-06-01T10:00:00',
        endTime: '2023-06-01T12:00:00',
        isFreeTime: true,
      }),
    });

    render(<EditSchedule params={{ scheduleId: '1' }} />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('キャンセル'));
    });

    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('エラー時にエラーメッセージを表示する', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('エラーが発生しました'));

    render(<EditSchedule params={{ scheduleId: '1' }} />);

    await waitFor(() => {
      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    });
  });
});