import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'メソッドが許可されていません' });
  }

  const { username, email, password } = req.body;

  if (!username || !email) {
    return res.status(400).json({ message: '無効なリクエストデータです' });
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ message: '認証に失敗しました' });
    }

    const updates: { username: string; email: string; password_hash?: string } = {
      username,
      email,
    };

    if (password) {
      const { data: passwordData, error: passwordError } = await supabase.auth.updateUser({
        password: password
      });

      if (passwordError) {
        return res.status(500).json({ message: 'パスワードの更新に失敗しました' });
      }
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .single();

    if (error) {
      return res.status(500).json({ message: 'プロフィールの更新に失敗しました' });
    }

    res.status(200).json({ message: 'プロフィールが更新されました', user: data });
  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}