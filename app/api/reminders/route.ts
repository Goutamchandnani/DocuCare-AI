import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { sendReminderEmail } from '../../../lib/email';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  // This route should be protected or only accessible via a secure cron job
  // For MVP, we'll proceed, but in production, add authentication/authorization

  try {
    const { data: medications, error } = await supabase
      .from('medications')
      .select('*, profiles(email)')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching medications:', error);
      return NextResponse.json({ error: 'Failed to fetch medications' }, { status: 500 });
    }

    if (!medications || medications.length === 0) {
      return NextResponse.json({ message: 'No active medications found.' }, { status: 200 });
    }

    const now = new Date();
    const currentDay = now.toLocaleString('en-US', { weekday: 'long' }); // e.g., "Monday"
    const currentTime = now.toTimeString().slice(0, 5); // e.g., "14:30"

    let emailsSentCount = 0;

    for (const medication of medications) {
      const userEmail = medication.profiles?.email;

      if (!userEmail) {
        console.warn(`Skipping reminder for medication ${medication.id}: No user email found.`);
        continue;
      }

      const reminderTimes = medication.reminder_time ? medication.reminder_time.split(',') : [];
      const reminderDays = medication.reminder_days ? medication.reminder_days.split(',') : [];

      const isDaily = medication.reminder_frequency === 'daily';
      const isTwiceDaily = medication.reminder_frequency === 'twice_daily';
      const isWeekly = medication.reminder_frequency === 'weekly';

      let shouldSendReminder = false;

      if (isDaily || isTwiceDaily) {
        // For daily and twice_daily, check if current time matches any reminder time
        shouldSendReminder = reminderTimes.includes(currentTime);
      } else if (isWeekly) {
        // For weekly, check if current day and time match
        shouldSendReminder = reminderDays.includes(currentDay) && reminderTimes.includes(currentTime);
      }

      if (shouldSendReminder) {
        console.log(`Attempting to send reminder for ${medication.name} to ${userEmail} at ${currentTime}`);
        try {
          await sendReminderEmail({
            to: userEmail,
            medicationName: medication.name,
            dosage: medication.dosage,
            instructions: medication.instructions || 'No specific instructions.',
            reminderTime: currentTime,
          });
          emailsSentCount++;
        } catch (emailError) {
          console.error(`Failed to send email for medication ${medication.id}:`, emailError);
        }
      }
    }

    return NextResponse.json({ message: `Reminder check completed. ${emailsSentCount} emails sent.` }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in reminders API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
