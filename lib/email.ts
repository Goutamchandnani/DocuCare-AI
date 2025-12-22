import nodemailer from 'nodemailer';

interface ReminderEmailProps {
  to: string;
  medicationName: string;
  dosage: string;
  instructions: string;
  reminderTime: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587', 10),
  secure: process.env.EMAIL_SERVER_PORT === '465', // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendReminderEmail({
  to,
  medicationName,
  dosage,
  instructions,
  reminderTime,
}: ReminderEmailProps) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM, // sender address
      to: to, // list of receivers
      subject: `Medication Reminder: ${medicationName} at ${reminderTime}`,
      text: `Hi,

This is a reminder to take your ${medicationName}.
Dosage: ${dosage}
Instructions: ${instructions}

Best regards,
DocuCare AI`,
      html: `<p>Hi,</p>
             <p>This is a reminder to take your <strong>${medicationName}</strong>.</p>
             <p><strong>Dosage:</strong> ${dosage}</p>
             <p><strong>Instructions:</strong> ${instructions}</p>
             <p>Best regards,<br/>DocuCare AI</p>`,
    });
    console.log(`Reminder email sent to ${to} for ${medicationName}`);
  } catch (error) {
    console.error(`Failed to send reminder email to ${to} for ${medicationName}:`, error);
    throw new Error('Failed to send reminder email');
  }
}
