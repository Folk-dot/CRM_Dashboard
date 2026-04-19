import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM    = 'Acme <onboarding@resend.dev>';
export const TEST_TO = 'delivered@resend.dev';

/**
 * sendEmail({ to, subject, html })
 * Wraps resend.emails.send and logs the result.
 * Uses the fixed test recipient so all mail goes to delivered@resend.dev for now.
 */
export const sendEmail = async ({ to, subject, html }) => {
    try {
        const { data, error } = await resend.emails.send({
            from:    FROM,
            to:      TEST_TO,   // override recipient during dev/test
            subject,
            html,
        });

        if (error) {
            console.error(`[email] Failed to send to ${to}: `, error);
            return null;
        }

        console.log(`[email] Sent "${subject}" → ${to} (id: ${data.id})`);
        return data;
    } catch (err) {
        console.error(`[email] Unexpected error sending to ${to}:`, err.message);
        return null;
    }
};
