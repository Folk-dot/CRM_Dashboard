import pool from '../db/pool.js';

export const getAllTreatmentHistory = async ({ patient_id } = {}) => {
    const where  = patient_id ? `WHERE th.patient_id = $1` : '';
    const values = patient_id ? [patient_id] : [];
    const { rows } = await pool.query(
        `SELECT th.*,
                p.full_name AS patient_name,
                t.name      AS treatment_name,
                d.full_name AS doctor_name
         FROM treatment_history th
         LEFT JOIN patients   p ON p.id = th.patient_id
         LEFT JOIN treatments t ON t.id = th.treatment_id
         LEFT JOIN doctors    d ON d.id = th.doctor_id
         ${where}
         ORDER BY th.performed_at DESC`,
        values
    );
    return rows;
};

export const getTreatmentHistoryById = async (id) => {
    const { rows } = await pool.query(
        `SELECT th.*,
                p.full_name AS patient_name,
                t.name      AS treatment_name,
                d.full_name AS doctor_name
         FROM treatment_history th
         LEFT JOIN patients   p ON p.id = th.patient_id
         LEFT JOIN treatments t ON t.id = th.treatment_id
         LEFT JOIN doctors    d ON d.id = th.doctor_id
         WHERE th.id = $1`,
        [id]
    );
    return rows[0] ?? null;
};

export const createTreatmentHistory = async (data) => {
    const { patient_id, appointment_id, doctor_id, treatment_id, performed_at, notes, next_step } = data;
    const { rows } = await pool.query(
        `INSERT INTO treatment_history
            (patient_id, appointment_id, doctor_id, treatment_id, performed_at, notes, next_step)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING *`,
        [patient_id, appointment_id, doctor_id, treatment_id, performed_at, notes, next_step]
    );
    return rows[0];
};

export const updateTreatmentHistory = async (id, data) => {
    const fields = [];
    const values = [];
    const allowed = ['patient_id','appointment_id','doctor_id','treatment_id','performed_at','notes','next_step'];
    allowed.forEach((key) => {
        if (data[key] !== undefined) {
            values.push(data[key]);
            fields.push(`${key} = $${values.length}`);
        }
    });
    if (!fields.length) return null;
    values.push(id);
    const { rows } = await pool.query(
        `UPDATE treatment_history SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
        values
    );
    return rows[0] ?? null;
};

export const deleteTreatmentHistory = async (id) => {
    const { rows } = await pool.query(
        `DELETE FROM treatment_history WHERE id = $1 RETURNING *`,
        [id]
    );
    return rows[0] ?? null;
};
