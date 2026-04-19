/**
 * appointmentReminderHtml({ patientName, doctorName, treatmentName, scheduledAt })
 * Email sent the day before an appointment.
 */
export const appointmentReminderHtml = ({ patientName, doctorName, treatmentName, scheduledAt }) => {
    const date = new Date(scheduledAt).toLocaleDateString('en-GB', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const time = new Date(scheduledAt).toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit',
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Appointment Reminder</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Helvetica Neue',Arial,sans-serif;color:#111827;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:#1D9E75;padding:28px 36px;">
            <p style="margin:0;font-size:18px;font-weight:600;color:#ffffff;">DentaCare Clinic</p>
            <p style="margin:4px 0 0;font-size:13px;color:#a7f3d0;">Bangkok Dental Clinic</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 36px;">
            <p style="margin:0 0 8px;font-size:15px;color:#374151;">Dear <strong>${patientName}</strong>,</p>
            <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
              This is a friendly reminder that you have a dental appointment scheduled for <strong>tomorrow</strong>.
            </p>

            <!-- Appointment box -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;margin-bottom:24px;">
              <tr>
                <td style="padding:20px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:5px 0;font-size:12px;color:#6b7280;width:120px;">Date</td>
                      <td style="padding:5px 0;font-size:13px;font-weight:600;color:#111827;">${date}</td>
                    </tr>
                    <tr>
                      <td style="padding:5px 0;font-size:12px;color:#6b7280;">Time</td>
                      <td style="padding:5px 0;font-size:13px;font-weight:600;color:#111827;">${time}</td>
                    </tr>
                    <tr>
                      <td style="padding:5px 0;font-size:12px;color:#6b7280;">Treatment</td>
                      <td style="padding:5px 0;font-size:13px;color:#111827;">${treatmentName ?? 'Dental appointment'}</td>
                    </tr>
                    <tr>
                      <td style="padding:5px 0;font-size:12px;color:#6b7280;">Doctor</td>
                      <td style="padding:5px 0;font-size:13px;color:#111827;">${doctorName}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 8px;font-size:13px;color:#6b7280;line-height:1.6;">
              Please arrive 10 minutes early. If you need to reschedule, contact us as soon as possible.
            </p>
            <p style="margin:0;font-size:13px;color:#6b7280;">
              We look forward to seeing you!
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 36px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
              Bangkok Dental Clinic &bull; This is an automated reminder. Please do not reply to this email.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

/**
 * reminderDueHtml({ patientName, topic, dueDate, notes })
 * Email sent on the day a reminder is due.
 */
export const reminderDueHtml = ({ patientName, topic, dueDate, notes }) => {
    const date = new Date(dueDate).toLocaleDateString('en-GB', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Follow-up Reminder</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Helvetica Neue',Arial,sans-serif;color:#111827;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:#1D9E75;padding:28px 36px;">
            <p style="margin:0;font-size:18px;font-weight:600;color:#ffffff;">DentaCare Clinic</p>
            <p style="margin:4px 0 0;font-size:13px;color:#a7f3d0;">Bangkok Dental Clinic</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 36px;">
            <p style="margin:0 0 8px;font-size:15px;color:#374151;">Dear <strong>${patientName}</strong>,</p>
            <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
              Our records show that today is the date for your scheduled follow-up. We wanted to reach out to make sure everything is going well.
            </p>

            <!-- Reminder box -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;margin-bottom:24px;">
              <tr>
                <td style="padding:20px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:5px 0;font-size:12px;color:#6b7280;width:120px;">Follow-up</td>
                      <td style="padding:5px 0;font-size:13px;font-weight:600;color:#111827;">${topic ?? 'Dental follow-up'}</td>
                    </tr>
                    <tr>
                      <td style="padding:5px 0;font-size:12px;color:#6b7280;">Due date</td>
                      <td style="padding:5px 0;font-size:13px;font-weight:600;color:#111827;">${date}</td>
                    </tr>
                    ${notes ? `
                    <tr>
                      <td style="padding:5px 0;font-size:12px;color:#6b7280;vertical-align:top;">Notes</td>
                      <td style="padding:5px 0;font-size:13px;color:#374151;">${notes}</td>
                    </tr>` : ''}
                  </table>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 8px;font-size:13px;color:#6b7280;line-height:1.6;">
              If you have not yet booked an appointment, please contact us at your earliest convenience.
            </p>
            <p style="margin:0;font-size:13px;color:#6b7280;">
              Your health is our priority — we look forward to hearing from you.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 36px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
              Bangkok Dental Clinic &bull; This is an automated reminder. Please do not reply to this email.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
};
