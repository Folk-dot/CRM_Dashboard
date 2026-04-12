import pool from '../db/pool.js';

export const getAllAppointments = async ({ status, date, patient_id, doctor_id } = {}) => {
    const conditions = [];
    const values     = [];

    if (status)     { values.push(status);     conditions.push(`a.status = $${values.length}`); }
    if (patient_id) { values.push(patient_id); conditions.push(`a.patient_id = $${values.length}`); }
    if (doctor_id)  { values.push(doctor_id);  conditions.push(`a.doctor_id = $${values.length}`); }
    if (date)       { values.push(date);        conditions.push(`DATE(a.scheduled_at) = $${values.length}`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(
        `SELECT a.*,
                p.full_name  AS patient_name,
                d.full_name  AS doctor_name,
                t.name       AS treatment_name
         FROM appointments a
         LEFT JOIN patients   p ON p.id = a.patient_id
         LEFT JOIN doctors    d ON d.id = a.doctor_id
         LEFT JOIN treatments t ON t.id = a.treatment_id
         ${where}
         ORDER BY a.scheduled_at DESC`,
        values
    );
    return rows;
};

export const getAppointmentById = async (id) => {
    const { rows } = await pool.query(
        `SELECT a.*,
                p.full_name  AS patient_name,
                d.full_name  AS doctor_name,
                t.name       AS treatment_name
         FROM appointments a
         LEFT JOIN patients   p ON p.id = a.patient_id
         LEFT JOIN doctors    d ON d.id = a.doctor_id
         LEFT JOIN treatments t ON t.id = a.treatment_id
         WHERE a.id = $1`,
        [id]
    );
    return rows[0] ?? null;
};

export const createAppointment = async (data) => {
    const { patient_id, doctor_id, treatment_id, scheduled_at, duration_min, status = 'Upcoming', notes } = data;
    const { rows } = await pool.query(
        `INSERT INTO appointments
            (patient_id, doctor_id, treatment_id, scheduled_at, duration_min, status, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [patient_id, doctor_id, treatment_id, scheduled_at, duration_min, status, notes]
    );
    return rows[0];
};

export const updateAppointment = async (id, data) => {
    const fields = [];
    const values = [];
    const allowed = ['patient_id','doctor_id','treatment_id','scheduled_at','duration_min','status','notes'];
    allowed.forEach((key) => {
        if (data[key] !== undefined) {
            values.push(data[key]);
            fields.push(`${key} = $${values.length}`);
        }
    });
    if (!fields.length) return null;
    values.push(id);
    const { rows } = await pool.query(
        `UPDATE appointments SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
        values
    );
    return rows[0] ?? null;
};

export const deleteAppointment = async (id) => {
    const { rows } = await pool.query(`DELETE FROM appointments WHERE id = $1 RETURNING *`, [id]);
    return rows[0] ?? null;
};

export const getTodayAppointments = async () => {
    const { rows } = await pool.query(
        `SELECT a.*,
                p.full_name AS patient_name,
                d.full_name AS doctor_name,
                t.name      AS treatment_name
         FROM appointments a
         LEFT JOIN patients   p ON p.id = a.patient_id
         LEFT JOIN doctors    d ON d.id = a.doctor_id
         LEFT JOIN treatments t ON t.id = a.treatment_id
         WHERE DATE(a.scheduled_at) = CURRENT_DATE
         ORDER BY a.scheduled_at`
    );
    return rows;
};
