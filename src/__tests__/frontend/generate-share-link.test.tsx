import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GenerateShareLink from '@/app/generate-share-link/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('GenerateShareLink', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ link: 'https://example.com/share/abc123' }),
      })
    );
  });

  it('有効期限フィールドが正しくレンダリングされる', () => {
    render(<GenerateShareLink />);
    expect(screen.getByLabelText('有効期限')).toBeInTheDocument();
  });

  it('リンク生成ボタンが正しくレンダリングされる', () => {
    render(<GenerateShareLink />);
    expect(screen.getByText('リンクを生成')).toBeInTheDocument();
  });

  it('リンク生成ボタンをクリックするとAPIが呼び出される', async () => {
    render(<GenerateShareLink />);
    fireEvent.click(screen.getByText('リンクを生成'));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
  });

  it('APIからのレスポンスが表示される', async () => {
    render(<GenerateShareLink />);
    fireEvent.click(screen.getByText('リンクを生成'));
    await waitFor(() => {
      expect(screen.getByText('https://example.com/share/abc123')).toBeInTheDocument();
    });
  });

  it('コピーボタンが正しく機能する', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });
    render(<GenerateShareLink />);
    fireEvent.click(screen.getByText('リンクを生成'));
    await waitFor(() => {
      expect(screen.getByText('https://example.com/share/abc123')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('コピー'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/share/abc123');
  });

  it('有効期限を設定してリンクを生成できる', async () => {
    render(<GenerateShareLink />);
    fireEvent.change(screen.getByLabelText('有効期限'), { target: { value: '2023-12-31' } });
    fireEvent.click(screen.getByText('リンクを生成'));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ expirationDate: '2023-12-31' }),
        })
      );
    });
  });

  it('エラー時にエラーメッセージが表示される', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'エラーが発生しました' }),
      })
    );
    render(<GenerateShareLink />);
    fireEvent.click(screen.getByText('リンクを生成'));
    await waitFor(() => {
      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    });
  });
});