import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/supabase';

export default async function getFriends(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: '認証エラー' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: '認証エラー' });
    }

    const { data: friends, error: friendsError } = await supabase
      .from('friends')
      .select('friend_id, users(id, username)')
      .eq('user_id', user.id)
      .eq('status', 'approved');

    if (friendsError) {
      console.error('友達リスト取得エラー:', friendsError);
      return res.status(500).json({ error: 'データベースエラー' });
    }

    const friendsList = friends.map((friend) => ({
      id: friend.users.id,
      username: friend.users.username,
    }));

    return res.status(200).json(friendsList);
  } catch (error) {
    console.error('エラー:', error);
    return res.status(500).json({ error: 'サーバーエラー' });
  }
}