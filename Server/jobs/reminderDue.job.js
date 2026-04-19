import pool from '../db/pool.js';
import { sendEmail } from '../emails/resend.js';
import { reminderDueHtml } from '../emails/templates.js';

/**
 * sendReminderDueEmails
 * Queries all reminders whose due_date is today and status is 'Upcoming'.
 * Sends one email per reminder. Status is NOT updated here —
 * status is derived from due_date at query time (see reminders.service.js).
 * Runs daily at 10:00 AM via node-cron.
 */
export const sendReminderDueEmails = async () => {
    console.log('[job:reminders] Starting reminder due job…');

    const { rows } = await pool.query(`
        SELECT
            r.id,
            r.topic,
            r.due_date,
            r.notes,
            p.full_name AS patient_name,
            p.email     AS patient_email
        FROM reminders r
        JOIN patients p ON p.id = r.patient_id
        WHERE r.due_date = CURRENT_DATE
          AND r.status   = 'Upcoming'
          AND p.email IS NOT NULL
    `);

    if (!rows.length) {
        console.log('[job:reminders] No reminders due today — nothing to send.');
        return;
    }

    console.log(`[job:reminders] Found ${rows.length} reminder(s) due today.`);

    const results = await Promise.allSettled(
        rows.map((reminder) =>
            sendEmail({
                to:      reminder.patient_email,
                subject: `Follow-up reminder from DentaCare: ${reminder.topic ?? 'Dental follow-up'}`,
                html:    reminderDueHtml({
                    patientName: reminder.patient_name,
                    topic:       reminder.topic,
                    dueDate:     reminder.due_date,
                    notes:       reminder.notes,
                }),
            })
        )
    );

    const sent   = results.filter(r => r.status === 'fulfilled' && r.value).length;
    const failed = results.length - sent;
    console.log(`[job:reminders] Done — ${sent} sent, ${failed} failed.`);
};
