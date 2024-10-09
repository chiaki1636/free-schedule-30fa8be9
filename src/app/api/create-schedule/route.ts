import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  const { startTime, endTime, isFreeTime } = req.body;

  if (!startTime || !endTime) {
    return res.status(400).json({ error: '開始時間と終了時間は必須です' });
  }

  if (new Date(startTime) >= new Date(endTime)) {
    return res.status(400).json({ error: '終了時間は開始時間より後に設定してください' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: '認証エラー' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: '認証エラー' });
    }

    const { data, error } = await supabase
      .from('schedules')
      .insert({
        user_id: user.id,
        start_time: startTime,
        end_time: endTime,
        is_free_time: isFreeTime
      })
      .select()
      .single();

    if (error) {
      console.error('スケジュール作成エラー:', error);
      return res.status(500).json({ error: 'スケジュールの作成に失敗しました' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('サーバーエラー:', error);
    return res.status(500).json({ error: 'サーバーエラー' });
  }
}