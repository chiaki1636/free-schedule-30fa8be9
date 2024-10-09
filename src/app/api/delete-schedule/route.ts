import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  const { scheduleId } = req.query;

  if (!scheduleId) {
    return res.status(400).json({ error: 'スケジュールIDが指定されていません' });
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ error: '認証されていません' });
    }

    const { error: deleteError } = await supabase
      .from('schedules')
      .delete()
      .eq('id', scheduleId)
      .eq('user_id', user.id);

    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        return res.status(404).json({ error: 'スケジュールが見つかりません' });
      }
      throw deleteError;
    }

    return res.status(200).json({ message: 'スケジュールが正常に削除されました' });
  } catch (error) {
    console.error('スケジュール削除エラー:', error);
    return res.status(500).json({ error: 'スケジュールの削除中にエラーが発生しました' });
  }
}