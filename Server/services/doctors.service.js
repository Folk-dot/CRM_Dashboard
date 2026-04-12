import pool from '../db/pool.js';

export const getAllDoctors = async () => {
    const { rows } = await pool.query(`SELECT * FROM doctors ORDER BY full_name`);
    return rows;
};

export const getDoctorById = async (id) => {
    const { rows } = await pool.query(`SELECT * FROM doctors WHERE id = $1`, [id]);
    return rows[0] ?? null;
};

export const getDoctorAppointments = async (id) => {
    const { rows } = await pool.query(
        `SELECT a.*, p.full_name AS patient_name, t.name AS treatment_name
         FROM appointments a
         LEFT JOIN patients   p ON p.id = a.patient_id
         LEFT JOIN treatments t ON t.id = a.treatment_id
         WHERE a.doctor_id = $1
         ORDER BY a.scheduled_at DESC`,
        [id]
    );
    return rows;
};

export const createDoctor = async (data) => {
    const { full_name, gender, phone, email, speciality } = data;
    const { rows } = await pool.query(
        `INSERT INTO doctors (full_name, gender, phone, email, speciality)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [full_name, gender, phone, email, speciality]
    );
    return rows[0];
};

export const updateDoctor = async (id, data) => {
    const fields = [];
    const values = [];
    const allowed = ['full_name','gender','phone','email','speciality'];
    allowed.forEach((key) => {
        if (data[key] !== undefined) {
            values.push(data[key]);
            fields.push(`${key} = $${values.length}`);
        }
    });
    if (!fields.length) return null;
    values.push(id);
    const { rows } = await pool.query(
        `UPDATE doctors SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
        values
    );
    return rows[0] ?? null;
};

export const deleteDoctor = async (id) => {
    const { rows } = await pool.query(`DELETE FROM doctors WHERE id = $1 RETURNING *`, [id]);
    return rows[0] ?? null;
};
