import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/supabase';

export async function PUT(req: NextRequest) {
  try {
    const { id, startTime, endTime, isFreeTime } = await req.json();

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // スケジュールの存在確認
    const { data: schedule, error: scheduleError } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', id)
      .single();

    if (scheduleError || !schedule) {
      return NextResponse.json({ error: 'スケジュールが見つかりません' }, { status: 404 });
    }

    // スケジュールの所有者確認
    if (schedule.user_id !== user.id) {
      return NextResponse.json({ error: 'このスケジュールを更新する権限がありません' }, { status: 403 });
    }

    // 日時形式の検証
    if (!isValidDate(startTime) || !isValidDate(endTime)) {
      return NextResponse.json({ error: '無効な日時形式です' }, { status: 400 });
    }

    // 終了時間が開始時間より後であることを確認
    if (new Date(endTime) <= new Date(startTime)) {
      return NextResponse.json({ error: '終了時間は開始時間より後である必要があります' }, { status: 400 });
    }

    // スケジュールの更新
    const { data: updatedSchedule, error: updateError } = await supabase
      .from('schedules')
      .update({ start_time: startTime, end_time: endTime, is_free_time: isFreeTime })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'スケジュールの更新中にエラーが発生しました' }, { status: 500 });
    }

    return NextResponse.json(updatedSchedule);
  } catch (error) {
    console.error('スケジュール更新エラー:', error);
    return NextResponse.json({ error: 'スケジュールの更新中にエラーが発生しました' }, { status: 500 });
  }
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}