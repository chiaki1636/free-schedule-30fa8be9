import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { emailNotifications, pushNotifications, notificationFrequency } = req.body;

  if (typeof emailNotifications !== 'boolean' || typeof pushNotifications !== 'boolean' || typeof notificationFrequency !== 'string') {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        email_notifications: emailNotifications,
        push_notifications: pushNotifications,
        notification_frequency: notificationFrequency,
      })
      .eq('id', user.id);

    if (error) {
      console.error('Failed to update notification settings:', error);
      return res.status(500).json({ error: 'Failed to update notification settings' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}