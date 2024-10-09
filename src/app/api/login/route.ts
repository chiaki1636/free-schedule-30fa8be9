import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/supabase';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'ユーザー名とパスワードが必要です' });
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (authError) {
      return res.status(401).json({ error: '認証に失敗しました' });
    }

    if (!authData.user) {
      return res.status(401).json({ error: 'ユーザーが見つかりません' });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      return res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }

    const token = jwt.sign(
      { userId: userData.id, username: userData.username },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    res.status(200).json({ token, user: userData });
  } catch (error) {
    console.error('ログインエラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
}