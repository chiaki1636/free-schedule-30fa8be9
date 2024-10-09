import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import { supabase } from '@/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'メソッドが許可されていません' });
  }

  const { username, email, password } = req.body;

  // バリデーション
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'すべてのフィールドを入力してください' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'パスワードは8文字以上である必要があります' });
  }

  try {
    // ユーザー名とメールアドレスの一意性を確認
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select()
      .or(`username.eq.${username},email.eq.${email}`)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingUser) {
      return res.status(409).json({ message: 'ユーザー名またはメールアドレスが既に存在します' });
    }

    // パスワードをハッシュ化
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Supabaseの認証機能を使用してユーザーを登録
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw authError;
    }

    // usersテーブルに新規ユーザーを登録
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: authUser.user?.id,
        username,
        email,
        password_hash: hashedPassword,
      })
      .single();

    if (insertError) {
      throw insertError;
    }

    res.status(201).json({ message: 'ユーザーが正常に登録されました', user: newUser });
  } catch (error) {
    console.error('登録エラー:', error);
    res.status(500).json({ message: '内部サーバーエラー' });
  }
}