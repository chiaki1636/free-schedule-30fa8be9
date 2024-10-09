import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/supabase';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { expirationDate } = await req.json();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '認証されていません' }, { status: 401 });
    }

    const linkToken = crypto.randomBytes(16).toString('hex');

    const { data, error } = await supabase
      .from('share_links')
      .insert({
        user_id: user.id,
        link_token: linkToken,
        expiration_date: expirationDate || null,
      })
      .select()
      .single();

    if (error) {
      console.error('共有リンク生成エラー:', error);
      return NextResponse.json({ error: '共有リンクの生成に失敗しました' }, { status: 500 });
    }

    const shareLink = `${process.env.NEXT_PUBLIC_APP_URL}/shared/${linkToken}`;

    return NextResponse.json({ link: shareLink });
  } catch (error) {
    console.error('予期せぬエラー:', error);
    return NextResponse.json({ error: '予期せぬエラーが発生しました' }, { status: 500 });
  }
}