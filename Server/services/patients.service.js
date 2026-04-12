import pool from '../db/pool.js';

export const getAllPatients = async ({ status, search } = {}) => {
    const conditions = [];
    const values     = [];

    if (status) {
        values.push(status);
        conditions.push(`status = $${values.length}`);
    }
    if (search) {
        values.push(`%${search}%`);
        conditions.push(`(full_name ILIKE $${values.length} OR email ILIKE $${values.length} OR phone ILIKE $${values.length})`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(
        `SELECT * FROM patients ${where} ORDER BY created_at DESC`,
        values
    );
    return rows;
};

export const getPatientById = async (id) => {
    const { rows } = await pool.query(
        `SELECT * FROM patients WHERE id = $1`,
        [id]
    );
    return rows[0] ?? null;
};

export const getPatientHistory = async (id) => {
    const { rows } = await pool.query(
        `SELECT th.*, t.name AS treatment_name, d.full_name AS doctor_name
         FROM treatment_history th
         LEFT JOIN treatments t ON t.id = th.treatment_id
         LEFT JOIN doctors    d ON d.id = th.doctor_id
         WHERE th.patient_id = $1
         ORDER BY th.performed_at DESC`,
        [id]
    );
    return rows;
};

export const createPatient = async (data) => {
    const {
        full_name, date_of_birth, gender, phone,
        email, address, allergies, notes, status = 'Active'
    } = data;

    const { rows } = await pool.query(
        `INSERT INTO patients
            (full_name, date_of_birth, gender, phone, email, address, allergies, notes, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING *`,
        [full_name, date_of_birth, gender, phone, email, address, allergies, notes, status]
    );
    return rows[0];
};

export const updatePatient = async (id, data) => {
    const fields  = [];
    const values  = [];

    const allowed = ['full_name','date_of_birth','gender','phone','email','address','allergies','notes','status'];
    allowed.forEach((key) => {
        if (data[key] !== undefined) {
            values.push(data[key]);
            fields.push(`${key} = $${values.length}`);
        }
    });

    if (!fields.length) return null;

    values.push(id);
    const { rows } = await pool.query(
        `UPDATE patients SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
        values
    );
    return rows[0] ?? null;
};

export const deletePatient = async (id) => {
    const { rows } = await pool.query(
        `DELETE FROM patients WHERE id = $1 RETURNING *`,
        [id]
    );
    return rows[0] ?? null;
};
