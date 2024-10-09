import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    const { data, error } = await supabase
      .from('friends')
      .update({ status: 'approved' })
      .eq('id', requestId)
      .eq('friend_id', user.id)
      .select();

    if (error) {
      console.error('友達リクエスト承認エラー:', error);
      return res.status(500).json({ error: '友達リクエストの承認中にエラーが発生しました' });
    }

    if (data && data.length > 0) {
      return res.status(200).json({ message: '友達リクエストが承認されました' });
    } else {
      return res.status(404).json({ error: '友達リクエストが見つかりません' });
    }
  } catch (error) {
    console.error('予期せぬエラー:', error);
    return res.status(500).json({ error: '予期せぬエラーが発生しました' });
  }
}