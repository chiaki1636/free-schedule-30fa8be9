import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/supabase';

export default async function handleRejectFriendRequest(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  const { requestId } = req.body;

  if (!requestId) {
    return res.status(400).json({ error: 'リクエストIDが必要です' });
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ error: '認証されていません' });
    }

    const { error: deleteError } = await supabase
      .from('friends')
      .delete()
      .eq('id', requestId);

    if (deleteError) {
      throw new Error('友達リクエストの拒否中にエラーが発生しました');
    }

    return res.status(200).json({ message: '友達リクエストを拒否しました' });
  } catch (error) {
    console.error('エラー:', error);
    return res.status(500).json({ error: '友達リクエストの拒否中にエラーが発生しました' });
  }
}