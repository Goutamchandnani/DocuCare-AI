import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { sendReminderEmail } from '../../../lib/email'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Fetch all active medications
    const { data: medications, error: medicationError } = await supabase
      .from('medications')
      .select('*, profiles(email)') // Select medication details and user's email
      .eq('is_active', true)

    if (medicationError) {
      console.error('Error fetching medications:', medicationError)
      return NextResponse.json({ error: 'Error fetching medications' }, { status: 500 })
    }

    if (!medications || medications.length === 0) {
      return NextResponse.json({ message: 'No active medications found.' })
    }

    let sentCount = 0
    for (const medication of medications) {
      const userEmail = (medication.profiles as { email: string }).email

      if (!userEmail) {
        console.warn(`No email found for user_id: ${medication.user_id}`)
        continue
      }

      // Determine if a reminder needs to be sent based on reminder_time and reminder_frequency
      const lastReminderSent = medication.last_reminder_sent ? new Date(medication.last_reminder_sent) : null;
      const now = new Date();
      let shouldSendReminder = false;

      if (medication.reminder_time && medication.reminder_frequency) {
        const [hours, minutes] = medication.reminder_time.split(':').map(Number);
        const todayReminderTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);

        if (medication.reminder_frequency === 'daily') {
          // If no reminder has been sent yet, and current time is past today's scheduled reminder time
          if (!lastReminderSent && now.getTime() >= todayReminderTime.getTime()) {
            shouldSendReminder = true;
          }
          // If a reminder was sent, check if it was for a previous day
          // and if current time is past today's scheduled reminder time
          else if (lastReminderSent) {
            const lastReminderDay = new Date(lastReminderSent.getFullYear(), lastReminderSent.getMonth(), lastReminderSent.getDate());
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            if (lastReminderDay.getTime() < today.getTime() && now.getTime() >= todayReminderTime.getTime()) {
              shouldSendReminder = true;
            }
          }
        } else if (medication.reminder_frequency === 'twice_daily') {
          // TODO: Implement more sophisticated logic for twice_daily reminders.
          // This would likely require a second reminder_time field in the Medication interface
          // or a more complex scheduling mechanism. For now, this will not send twice_daily reminders.
          console.warn(`Twice daily reminder logic not fully implemented for medication: ${medication.name}`);
        } else if (medication.reminder_frequency === 'weekly') {
          // TODO: Implement logic for weekly reminders.
          // This would require a 'reminder_day_of_week' field in the Medication interface.
          // For now, this will not send weekly reminders.
          console.warn(`Weekly reminder logic not fully implemented for medication: ${medication.name}`);
        }
      }

      if (shouldSendReminder) {
        const mailOptions = {
          from: process.env.EMAIL_FROM,
          to: userEmail,
          subject: `Medication Reminder: ${medication.name}`,
          html: `
            <p>Hi,</p>
            <p>This is a reminder to take your medication:</p>
            <p><strong>${medication.name}</strong> - ${medication.dosage} (${medication.frequency})</p>
            <p>Instructions: ${medication.instructions || 'N/A'}</p>
            <p>Please remember to take your medication as prescribed.</p>
            <p>Best regards,</p>
            <p>DocuCare AI Team</p>
          `,
        }

        try {
          await sendReminderEmail({
            to: userEmail,
            medicationName: medication.name,
            dosage: medication.dosage,
            instructions: medication.instructions || 'N/A',
            reminderTime: medication.reminder_time || 'N/A',
          });
          console.log(`Reminder email sent for ${medication.name} to ${userEmail}`)

          // Update last_reminder_sent timestamp
          const { error: updateError } = await supabase
            .from('medications')
            .update({ last_reminder_sent: now.toISOString() })
            .eq('id', medication.id)

          if (updateError) {
            console.error(`Error updating last_reminder_sent for ${medication.name}:`, updateError)
          }
          sentCount++
        } catch (emailError) {
          console.error(`Error sending email for ${medication.name} to ${userEmail}:`, emailError)
        }
      }
    }

    return NextResponse.json({ message: `Reminder check completed. Sent ${sentCount} emails.` })
  } catch (error) {
    console.error('Unhandled error in reminders API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}