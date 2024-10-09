import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  const { linkToken } = req.query;

  if (!linkToken || typeof linkToken !== 'string') {
    return res.status(400).json({ error: 'リンクトークンが必要です' });
  }

  try {
    // 共有リンクの確認
    const { data: shareLink, error: shareLinkError } = await supabase
      .from('share_links')
      .select('user_id')
      .eq('link_token', linkToken)
      .single();

    if (shareLinkError || !shareLink) {
      return res.status(404).json({ error: '共有リンクが見つかりません' });
    }

    // スケジュールの取得
    const { data: schedules, error: schedulesError } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', shareLink.user_id);

    if (schedulesError) {
      return res.status(500).json({ error: 'スケジュールの取得に失敗しました' });
    }

    return res.status(200).json({ schedules });
  } catch (error) {
    console.error('エラー:', error);
    return res.status(500).json({ error: '内部サーバーエラーが発生しました' });
  }
}