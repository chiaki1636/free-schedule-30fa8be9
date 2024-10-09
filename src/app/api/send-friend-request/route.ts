import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  const { friendId } = req.body;

  if (!friendId) {
    return res.status(400).json({ error: 'friendIdは必須です' });
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ error: '認証されていません' });
    }

    const { data, error } = await supabase
      .from('friends')
      .insert({
        user_id: user.id,
        friend_id: friendId,
        status: 'pending'
      });

    if (error) {
      console.error('友達リクエスト送信エラー:', error);
      return res.status(500).json({ error: '友達リクエストの送信に失敗しました' });
    }

    return res.status(200).json({ message: '友達リクエストを送信しました' });
  } catch (error) {
    console.error('友達リクエスト送信エラー:', error);
    return res.status(500).json({ error: '友達リクエストの送信に失敗しました' });
  }
}