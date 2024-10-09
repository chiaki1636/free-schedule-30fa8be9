import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  try {
    const { user, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ error: '認証されていません' });
    }

    const { data: schedules, error: dbError } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', user.id);

    if (dbError) {
      throw new Error(dbError.message);
    }

    return res.status(200).json(schedules);
  } catch (error) {
    console.error('スケジュール取得エラー:', error);
    return res.status(500).json({ error: 'スケジュールの取得に失敗しました' });
  }
}