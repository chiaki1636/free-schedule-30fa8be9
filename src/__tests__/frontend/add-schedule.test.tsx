import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddSchedule from '@/app/add-schedule/page';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('AddSchedule', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
  });

  test('コンポーネントが正しくレンダリングされること', () => {
    render(<AddSchedule />);
    
    expect(screen.getByLabelText('開始時間')).toBeInTheDocument();
    expect(screen.getByLabelText('終了時間')).toBeInTheDocument();
    expect(screen.getByLabelText('暇な時間')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
  });

  test('フォームに入力して保存ボタンをクリックすると、スケジュールが作成されること', async () => {
    const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ id: 'new-schedule-id' }),
    } as any);

    render(<AddSchedule />);

    fireEvent.change(screen.getByLabelText('開始時間'), { target: { value: '2023-07-01T10:00' } });
    fireEvent.change(screen.getByLabelText('終了時間'), { target: { value: '2023-07-01T12:00' } });
    fireEvent.click(screen.getByLabelText('暇な時間'));
    fireEvent.click(screen.getByRole('button', { name: '保存' }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/schedules', expect.any(Object));
    });

    const router = useRouter();
    expect(router.push).toHaveBeenCalledWith('/');
  });

  test('キャンセルボタンをクリックすると、ホーム画面に戻ること', () => {
    render(<AddSchedule />);

    fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }));

    const router = useRouter();
    expect(router.push).toHaveBeenCalledWith('/');
  });

  test('フォームの入力が不完全な場合、エラーメッセージが表示されること', async () => {
    render(<AddSchedule />);

    fireEvent.click(screen.getByRole('button', { name: '保存' }));

    await waitFor(() => {
      expect(screen.getByText('開始時間と終了時間を入力してください')).toBeInTheDocument();
    });
  });

  test('終了時間が開始時間より早い場合、エラーメッセージが表示されること', async () => {
    render(<AddSchedule />);

    fireEvent.change(screen.getByLabelText('開始時間'), { target: { value: '2023-07-01T12:00' } });
    fireEvent.change(screen.getByLabelText('終了時間'), { target: { value: '2023-07-01T10:00' } });
    fireEvent.click(screen.getByRole('button', { name: '保存' }));

    await waitFor(() => {
      expect(screen.getByText('終了時間は開始時間より後に設定してください')).toBeInTheDocument();
    });
  });
});