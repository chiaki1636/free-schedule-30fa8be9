import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Friends from '@/app/friends/page';
import { useState, useEffect } from 'react';

// モックの作成
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useEffect: jest.fn(),
}));

jest.mock('axios');

describe('友達リスト画面', () => {
  const mockSetFriends = jest.fn();
  const mockSetSearchTerm = jest.fn();
  const mockFriends = [
    { id: '1', username: '友達1' },
    { id: '2', username: '友達2' },
  ];

  beforeEach(() => {
    (useState as jest.Mock).mockImplementation((initialState) => [initialState, mockSetFriends]);
    (useState as jest.Mock).mockImplementationOnce(() => [mockFriends, mockSetFriends]);
    (useState as jest.Mock).mockImplementationOnce(() => ['', mockSetSearchTerm]);
    (useEffect as jest.Mock).mockImplementation((f) => f());
    
    global.axios.get.mockResolvedValue({ data: mockFriends });
  });

  test('友達リストが正しく表示される', async () => {
    render(<Friends />);
    
    await waitFor(() => {
      expect(screen.getByText('友達1')).toBeInTheDocument();
      expect(screen.getByText('友達2')).toBeInTheDocument();
    });
  });

  test('友達検索バーが機能する', async () => {
    render(<Friends />);
    
    const searchInput = screen.getByPlaceholderText('友達を検索') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: '友達1' } });
    
    expect(mockSetSearchTerm).toHaveBeenCalledWith('友達1');
  });

  test('友達追加ボタンがクリックできる', () => {
    render(<Friends />);
    
    const addButton = screen.getByText('友達を追加');
    fireEvent.click(addButton);
    
    expect(global.mockNextRouter.push).toHaveBeenCalledWith('/add-friend');
  });

  test('友達をクリックすると詳細画面に遷移する', () => {
    render(<Friends />);
    
    const friendItem = screen.getByText('友達1');
    fireEvent.click(friendItem);
    
    expect(global.mockNextRouter.push).toHaveBeenCalledWith('/friend/1');
  });

  test('エラー時にエラーメッセージが表示される', async () => {
    global.axios.get.mockRejectedValueOnce(new Error('友達リストの取得に失敗しました'));
    
    render(<Friends />);
    
    await waitFor(() => {
      expect(screen.getByText('友達リストの取得に失敗しました')).toBeInTheDocument();
    });
  });
});