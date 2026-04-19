import cron from 'node-cron';
import { sendAppointmentReminders } from './appointmentReminders.job.js';
import { sendReminderDueEmails }    from './reminderDue.job.js';

/**
 * registerJobs
 * Call once at app startup. Schedules both daily email jobs at 10:00 AM server time.
 *
 * Cron expression: '0 10 * * *'
 *   ┌─── minute  (0)
 *   │ ┌─ hour    (10)
 *   │ │ ┌ day of month (*)
 *   │ │ │ ┌ month (*)
 *   │ │ │ │ ┌ day of week (*)
 *   0 10 * * *
 */
export const registerJobs = () => {
    // ── Job 1: Appointment reminders (send for tomorrow's appointments) ──
    cron.schedule('0 10 * * *', async () => {
        try {
            await sendAppointmentReminders();
        } catch (err) {
            console.error('[scheduler] appointmentReminders crashed:', err.message);
        }
    }, { timezone: 'Asia/Bangkok' });

    // ── Job 2: Reminder due emails (send for today's reminders) ──
    cron.schedule('0 10 * * *', async () => {
        try {
            await sendReminderDueEmails();
        } catch (err) {
            console.error('[scheduler] reminderDue crashed:', err.message);
        }
    }, { timezone: 'Asia/Bangkok' });

    console.log('[scheduler] Jobs registered — running daily at 10:00 AM (Asia/Bangkok)');
};
