import pool from '../db/pool.js';

export const getAllReminders = async ({ status, patient_id } = {}) => {
    const conditions = [];
    const values     = [];

    if (status)     { values.push(status);     conditions.push(`r.status = $${values.length}`); }
    if (patient_id) { values.push(patient_id); conditions.push(`r.patient_id = $${values.length}`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(
        `SELECT r.*, p.full_name AS patient_name, p.phone AS patient_phone
         FROM reminders r
         LEFT JOIN patients p ON p.id = r.patient_id
         ${where}
         ORDER BY r.due_date ASC`,
        values
    );
    return rows;
};

export const getReminderById = async (id) => {
    const { rows } = await pool.query(
        `SELECT r.*, p.full_name AS patient_name
         FROM reminders r
         LEFT JOIN patients p ON p.id = r.patient_id
         WHERE r.id = $1`,
        [id]
    );
    return rows[0] ?? null;
};

export const getOverdueReminders = async () => {
    const { rows } = await pool.query(
        `SELECT r.*, p.full_name AS patient_name, p.phone AS patient_phone
         FROM reminders r
         LEFT JOIN patients p ON p.id = r.patient_id
         WHERE r.status = 'Overdue' OR (r.due_date < CURRENT_DATE AND r.status = 'Upcoming')
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
    const fields = [];
    const values = [];
    const allowed = ['patient_id','topic','due_date','status','notes'];
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
    const { rows } = await pool.query(`DELETE FROM reminders WHERE id = $1 RETURNING *`, [id]);
    return rows[0] ?? null;
};
