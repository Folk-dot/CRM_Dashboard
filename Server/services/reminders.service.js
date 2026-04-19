import pool from '../db/pool.js';

/**
 * Status is derived from due_date at query time — never rely on the stored value alone.
 *   due_date = today  → 'Sent'
 *   due_date < today  → 'Overdue'
 *   due_date > today  → 'Upcoming'
 *   anything already Appointed / Cancelled → kept as-is
 */
const computedStatus = `
    CASE
        WHEN r.status IN ('Appointed', 'Cancelled') THEN r.status
        WHEN r.due_date = CURRENT_DATE              THEN 'Sent'
        WHEN r.due_date < CURRENT_DATE              THEN 'Overdue'
        ELSE 'Upcoming'
    END AS status
`;

export const getAllReminders = async ({ status, patient_id } = {}) => {
    const conditions = [];
    const values     = [];

    if (patient_id) {
        values.push(patient_id);
        conditions.push(`r.patient_id = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Filter by computed status in a subquery so we can use it in WHERE
    const statusFilter = status
        ? `WHERE computed.status = $${values.length + 1}`
        : '';
    if (status) values.push(status);

    const { rows } = await pool.query(
        `SELECT * FROM (
            SELECT
                r.id, r.patient_id, r.topic, r.due_date, r.notes, r.created_at,
                p.full_name    AS patient_name,
                p.phone        AS patient_phone,
                ${computedStatus}
            FROM reminders r
            LEFT JOIN patients p ON p.id = r.patient_id
            ${where}
        ) computed
        ${statusFilter}
        ORDER BY computed.due_date ASC`,
        values
    );
    return rows;
};

export const getReminderById = async (id) => {
    const { rows } = await pool.query(
        `SELECT
            r.id, r.patient_id, r.topic, r.due_date, r.notes, r.created_at,
            p.full_name AS patient_name,
            ${computedStatus}
         FROM reminders r
         LEFT JOIN patients p ON p.id = r.patient_id
         WHERE r.id = $1`,
        [id]
    );
    return rows[0] ?? null;
};

export const getOverdueReminders = async () => {
    const { rows } = await pool.query(
        `SELECT
            r.id, r.patient_id, r.topic, r.due_date, r.notes, r.created_at,
            p.full_name AS patient_name,
            p.phone     AS patient_phone,
            ${computedStatus}
         FROM reminders r
         LEFT JOIN patients p ON p.id = r.patient_id
         WHERE r.due_date < CURRENT_DATE
           AND r.status NOT IN ('Appointed', 'Cancelled')
         ORDER BY r.due_date ASC`
    );
    return rows;
};

export const createReminder = async (data) => {
    const { patient_id, topic, due_date, status = 'Upcoming', notes } = data;
    const { rows } = await pool.query(
        `INSERT INTO reminders (patient_id, topic, due_date, status, notes)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [patient_id, topic, due_date, status, notes]
    );
    return rows[0];
};

export const updateReminder = async (id, data) => {
    const fields  = [];
    const values  = [];
    const allowed = ['patient_id', 'topic', 'due_date', 'status', 'notes'];
    allowed.forEach((key) => {
        if (data[key] !== undefined) {
            values.push(data[key]);
            fields.push(`${key} = $${values.length}`);
        }
    });
    if (!fields.length) return null;
    values.push(id);
    const { rows } = await pool.query(
        `UPDATE reminders SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
        values
    );
    return rows[0] ?? null;
};

export const deleteReminder = async (id) => {
    const { rows } = await pool.query(
        `DELETE FROM reminders WHERE id = $1 RETURNING *`,
        [id]
    );
    return rows[0] ?? null;
};
