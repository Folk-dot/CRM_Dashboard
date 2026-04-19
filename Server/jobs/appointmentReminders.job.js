import pool from '../db/pool.js';
import { sendEmail } from '../emails/resend.js';
import { appointmentReminderHtml } from '../emails/templates.js';

/**
 * sendAppointmentReminders
 * Queries all appointments scheduled for tomorrow that are still 'Upcoming'.
 * Sends one reminder email per appointment to the patient.
 * Runs daily at 10:00 AM via node-cron.
 */
export const sendAppointmentReminders = async () => {
    console.log('[job:appointments] Starting appointment reminder job…');

    const { rows } = await pool.query(`
        SELECT
            a.id,
            a.scheduled_at,
            a.notes,
            p.full_name  AS patient_name,
            p.email      AS patient_email,
            d.full_name  AS doctor_name,
            t.name       AS treatment_name
        FROM appointments a
        JOIN patients    p ON p.id = a.patient_id
        JOIN doctors     d ON d.id = a.doctor_id
        LEFT JOIN treatments t ON t.id = a.treatment_id
        WHERE DATE(a.scheduled_at) = CURRENT_DATE + INTERVAL '1 day'
          AND a.status = 'Upcoming'
          AND p.email IS NOT NULL
    `);

    if (!rows.length) {
        console.log('[job:appointments] No upcoming appointments for tomorrow — nothing to send.');
        return;
    }

    console.log(`[job:appointments] Found ${rows.length} appointment(s) for tomorrow.`);

    const results = await Promise.allSettled(
        rows.map((apt) =>
            sendEmail({
                to:      apt.patient_email,
                subject: `Reminder: Your dental appointment tomorrow at DentaCare`,
                html:    appointmentReminderHtml({
                    patientName:   apt.patient_name,
                    doctorName:    apt.doctor_name,
                    treatmentName: apt.treatment_name,
                    scheduledAt:   apt.scheduled_at,
                }),
            })
        )
    );
    console.log(results);
    const sent   = results.filter(r => r.status === 'fulfilled' && r.value).length;
    const failed = results.length - sent;
    console.log(`[job:appointments] Done — ${sent} sent, ${failed} failed.`);
};
